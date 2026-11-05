/**
 * Deterministic Brand Intelligence Engine for BrandGuard
 * Pure, rule-based analysis without AI dependencies.
 */

export interface DeterministicFinding {
  id: string;
  layer: 'deterministic';
  category:
    | 'prohibited_term'
    | 'required_term'
    | 'fact_error'
    | 'date_error'
    | 'approved_phrase'
    | 'style'
    | 'accessibility'
    | 'unsupported_claim';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence: number; // 0-1
  affectedText: string;
  startOffset?: number;
  endOffset?: number;
  explanation: string;
  sourceRuleId?: string;
  approvedFactId?: string;
  suggestedCorrection?: string;
}

export interface BrandRuleInput {
  id: string;
  ruleType: string;
  name: string;
  pattern: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  isActive?: boolean;
}

export interface ApprovedFactInput {
  id: string;
  category: string;
  claim: string;
  value: string | null;
  unit?: string | null;
  isActive?: boolean;
}

export interface BrandTermInput {
  id: string;
  term: string;
  termType: 'approved' | 'prohibited' | 'preferred' | 'deprecated';
  preferredAlternative?: string | null;
}

export interface DeterministicEngineOptions {
  rules: BrandRuleInput[];
  approvedFacts?: ApprovedFactInput[];
  facts?: ApprovedFactInput[];
  terms: BrandTermInput[];
}

const SEVERITY_WEIGHT: Record<DeterministicFinding['severity'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

// Common acronyms and initialisms that should not trigger excessive capitalization warnings
const COMMON_ACRONYMS = new Set([
  'HTML',
  'HTTP',
  'HTTPS',
  'JSON',
  'REST',
  'SAAS',
  'GDPR',
  'HIPAA',
  'SLA',
  'UUID',
  'NASA',
  'NATO',
  'FAQS',
  'USPS',
  'FDIC',
  'FINRA',
  'SEC',
  'APY',
  'APR',
  'URL',
  'URI',
  'API',
  'SDK',
  'CSS',
  'SEO',
  'PDF',
  'B2B',
  'B2C',
  'SME',
  'ROI',
  'KPI',
  'CRM',
  'ERP',
  'SSO',
  'MFA',
  '2FA',
  'SDK',
]);

/**
 * Escapes regex special characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a word-boundary regular expression for a term or phrase.
 */
function createWordBoundaryRegex(term: string, flags = 'gi'): RegExp {
  const escaped = escapeRegExp(term.trim());
  const startsWithWord = /^\w/.test(term.trim());
  const endsWithWord = /\w$/.test(term.trim());

  const prefix = startsWithWord ? '\\b' : '(?<=^|\\s|[^\\w])';
  const suffix = endsWithWord ? '\\b' : '(?=$|\\s|[^\\w])';

  return new RegExp(`${prefix}${escaped}${suffix}`, flags);
}

/**
 * Checks content for prohibited or deprecated brand terms.
 */
export function checkProhibitedTerms(
  content: string,
  terms: BrandTermInput[]
): DeterministicFinding[] {
  if (!content || !content.trim() || !terms || terms.length === 0) {
    return [];
  }

  const findings: DeterministicFinding[] = [];
  const targetTerms = terms.filter(
    (t) => t.termType === 'prohibited' || t.termType === 'deprecated'
  );

  for (const term of targetTerms) {
    if (!term.term || !term.term.trim()) continue;

    const regex = createWordBoundaryRegex(term.term, 'gi');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const matchedText = match[0];
      const startOffset = match.index;
      const endOffset = startOffset + matchedText.length;

      const isProhibited = term.termType === 'prohibited';
      const severity: DeterministicFinding['severity'] = isProhibited ? 'high' : 'medium';

      const explanation = isProhibited
        ? `The term "${matchedText}" is prohibited.${
            term.preferredAlternative
              ? ` Please use "${term.preferredAlternative}" instead.`
              : ''
          }`
        : `The term "${matchedText}" is deprecated.${
            term.preferredAlternative
              ? ` Consider using "${term.preferredAlternative}" instead.`
              : ''
          }`;

      findings.push({
        id: `det-term-${crypto.randomUUID()}`,
        layer: 'deterministic',
        category: 'prohibited_term',
        severity,
        confidence: 1.0,
        affectedText: matchedText,
        startOffset,
        endOffset,
        explanation,
        suggestedCorrection: term.preferredAlternative ?? undefined,
      });

      if (regex.lastIndex === match.index) {
        regex.lastIndex++;
      }
    }
  }

  return findings;
}

/**
 * Checks if required brand terms are missing from content.
 * Flags missing required terms if content is long-form (or non-trivial).
 */
export function checkRequiredTerms(
  content: string,
  terms: BrandTermInput[]
): DeterministicFinding[] {
  if (!content || !content.trim() || !terms || terms.length === 0) {
    return [];
  }

  const words = content.trim().split(/\s+/).filter(Boolean);
  // Long-form content threshold (at least 50 words)
  const isLongForm = words.length >= 50;

  const findings: DeterministicFinding[] = [];
  const requiredTerms = terms.filter(
    (t) => (t.termType as string) === 'required' || t.termType === 'approved'
  );

  for (const term of requiredTerms) {
    if (!term.term || !term.term.trim()) continue;

    // Only flag missing approved terms if explicitly long-form content
    if (!isLongForm && term.termType === 'approved') {
      continue;
    }

    const regex = createWordBoundaryRegex(term.term, 'i');
    if (!regex.test(content)) {
      findings.push({
        id: `det-req-${crypto.randomUUID()}`,
        layer: 'deterministic',
        category: 'required_term',
        severity: 'medium',
        confidence: 1.0,
        affectedText: term.term,
        explanation: `Required brand term "${term.term}" was not found in this content.`,
        suggestedCorrection: term.term,
      });
    }
  }

  return findings;
}

/**
 * Checks content against approved brand facts.
 * - Extracts numeric claims (percentages, rates, prices, metrics).
 * - Matches claims to approved fact categories/claims.
 * - Flags contradictions as `fact_error` with high confidence.
 * - Flags unrecognized numeric claims as `unsupported_claim` with medium confidence.
 */
export function checkApprovedFacts(
  content: string,
  facts: ApprovedFactInput[]
): DeterministicFinding[] {
  if (!content || !content.trim() || !facts || facts.length === 0) {
    return [];
  }

  const activeFacts = facts.filter((f) => f.isActive !== false);
  if (activeFacts.length === 0) {
    return [];
  }

  const findings: DeterministicFinding[] = [];

  // Patterns for extracting numeric claims with context
  // 1. Percentage claims: e.g. "6.5% APY", "95% approval rate", "99% satisfaction rate", "4.75%"
  // 2. Currency/Pricing: e.g. "$29/month", "$100", "49 USD"
  // 3. Count/Metric claims: e.g. "10,000+ customers", "99.9% uptime"
  const claimRegexes = [
    // Number followed by % and optional keyword
    /(?:(\b\d+(?:,\d{3})*(?:\.\d+)?)\s*%\s*([a-zA-Z\s]{0,30}))/gi,
    // Context keyword followed by number and %
    /(?:([a-zA-Z\s]{1,30})\s*(?:of|is|at|offers?|earns?|guarantees?)?\s*(\b\d+(?:,\d{3})*(?:\.\d+)?)\s*%)/gi,
    // Currency claims
    /(?:\$\s*(\b\d+(?:,\d{3})*(?:\.\d+)?)\s*([a-zA-Z\/\s]{0,20}))/gi,
  ];

  interface DetectedClaim {
    matchedText: string;
    numValue: number;
    startOffset: number;
    endOffset: number;
    context: string;
  }

  const detectedClaims: DetectedClaim[] = [];

  // 1. Scan for percentage patterns
  const percentPattern = /(\b\d+(?:,\d{3})*(?:\.\d+)?)\s*%(?:\s+([a-zA-Z\s]{1,35}))?/gi;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = percentPattern.exec(content)) !== null) {
    const rawNum = pMatch[1].replace(/,/g, '');
    const numValue = parseFloat(rawNum);
    const trail = pMatch[2] ? pMatch[2].trim() : '';

    // Determine full claim phrase and local context window
    const startOffset = pMatch.index;
    let endOffset = startOffset + pMatch[0].length;
    // Capture surrounding context (up to 40 characters before and after)
    const contextStart = Math.max(0, startOffset - 40);
    const contextEnd = Math.min(content.length, endOffset + 40);
    const context = content.slice(contextStart, contextEnd);

    // If trail contains a meaningful descriptor (e.g., APY, approval rate, satisfaction rate)
    let fullMatchedText = pMatch[0].trim();
    if (trail) {
      // Pick first 2-3 words of trail as part of the claim
      const trailWords = trail.split(/\s+/).slice(0, 3).join(' ');
      if (trailWords) {
        fullMatchedText = `${pMatch[1]}% ${trailWords}`.trim();
        endOffset = startOffset + fullMatchedText.length;
      }
    }

    detectedClaims.push({
      matchedText: fullMatchedText,
      numValue,
      startOffset,
      endOffset,
      context,
    });

    if (percentPattern.lastIndex === pMatch.index) {
      percentPattern.lastIndex++;
    }
  }

  // Deduplicate detected claims by overlapping startOffset
  const uniqueClaims: DetectedClaim[] = [];
  for (const claim of detectedClaims) {
    const overlaps = uniqueClaims.some(
      (c) => Math.abs(c.startOffset - claim.startOffset) < 5
    );
    if (!overlaps) {
      uniqueClaims.push(claim);
    }
  }

  // Compare each detected numeric claim against approved facts
  for (const claim of uniqueClaims) {
    let matchedFact: ApprovedFactInput | null = null;
    let highestRelevance = 0;

    const claimContextLower = claim.context.toLowerCase();

    for (const fact of activeFacts) {
      const factClaimLower = fact.claim.toLowerCase();
      const factCategoryLower = fact.category.toLowerCase().replace(/_/g, ' ');

      // Check for exact mention of claim or category in the context
      let relevance = 0;
      if (claimContextLower.includes(factClaimLower)) {
        relevance += 5;
      }
      if (claimContextLower.includes(factCategoryLower)) {
        relevance += 4;
      }

      // Generic metric words that shouldn't match across completely different facts
      const STOP_WORDS = new Set([
        'rate',
        'rates',
        'percent',
        'percentage',
        'count',
        'number',
        'numbers',
        'amount',
        'score',
        'value',
        'total',
        'level',
        'ratio',
        'and',
        'the',
        'for',
        'with',
        'our',
        'per',
      ]);

      // Check keywords in fact claim, excluding generic stop words
      const keywords = factClaimLower
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

      for (const kw of keywords) {
        if (claimContextLower.includes(kw)) {
          relevance += 3;
        }
      }

      if (relevance > highestRelevance && relevance >= 3) {
        highestRelevance = relevance;
        matchedFact = fact;
      }
    }

    if (matchedFact && matchedFact.value !== null && matchedFact.value !== undefined) {
      const factNum = parseFloat(matchedFact.value.replace(/,/g, ''));
      const valuesMatch = !isNaN(factNum) && Math.abs(claim.numValue - factNum) < 0.001;

      if (!valuesMatch) {
        // Contradiction detected!
        const unitSuffix = matchedFact.unit ? `${matchedFact.unit}` : '';
        findings.push({
          id: `det-fact-${crypto.randomUUID()}`,
          layer: 'deterministic',
          category: 'fact_error',
          severity: 'high',
          confidence: 0.95,
          affectedText: claim.matchedText,
          startOffset: claim.startOffset,
          endOffset: claim.endOffset,
          explanation: `Fact contradiction: Content claims "${claim.matchedText}", but approved fact "${matchedFact.claim}" specifies ${matchedFact.value}${unitSuffix}.`,
          approvedFactId: matchedFact.id,
          suggestedCorrection: `${matchedFact.value}${unitSuffix}`,
        });
      }
      // If values match, the claim is verified by the approved fact - no finding generated.
    } else {
      // Unrecognized numeric claim: no matching approved fact found
      findings.push({
        id: `det-unsupported-${crypto.randomUUID()}`,
        layer: 'deterministic',
        category: 'unsupported_claim',
        severity: 'medium',
        confidence: 0.7,
        affectedText: claim.matchedText,
        startOffset: claim.startOffset,
        endOffset: claim.endOffset,
        explanation: `Unverified claim: Metric "${claim.matchedText}" does not match any approved brand facts. Verify this claim before publishing.`,
      });
    }
  }

  return findings;
}

/**
 * Checks content against custom brand rules.
 * - Treats `pattern` as a regular expression.
 * - Flags matches for `prohibited_term`, `style_rule`, and other matching rules.
 * - Flags absence for `required_term` rules.
 * - Checks exact phrasing for `approved_phrase` rules.
 */
export function checkBrandRules(
  content: string,
  rules: BrandRuleInput[]
): DeterministicFinding[] {
  if (!content || !content.trim() || !rules || rules.length === 0) {
    return [];
  }

  const findings: DeterministicFinding[] = [];

  for (const rule of rules) {
    if (rule.isActive === false) continue;
    if (!rule.pattern || !rule.pattern.trim()) continue;

    let regex: RegExp;
    try {
      regex = new RegExp(rule.pattern, 'gi');
    } catch {
      try {
        regex = new RegExp(escapeRegExp(rule.pattern), 'gi');
      } catch {
        continue;
      }
    }

    if (rule.ruleType === 'required_term') {
      regex.lastIndex = 0;
      if (!regex.test(content)) {
        findings.push({
          id: `det-rule-${crypto.randomUUID()}`,
          layer: 'deterministic',
          category: 'required_term',
          severity: rule.severity,
          confidence: 1.0,
          affectedText: rule.pattern,
          explanation: `Violation of rule "${rule.name}": Required pattern "${rule.pattern}" was not found in content.`,
          sourceRuleId: rule.id,
          suggestedCorrection: rule.pattern,
        });
      }
    } else if (rule.ruleType === 'approved_phrase') {
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        const matchedText = match[0];
        const canonical = rule.name.trim();

        if (matchedText !== canonical) {
          findings.push({
            id: `det-rule-${crypto.randomUUID()}`,
            layer: 'deterministic',
            category: 'approved_phrase',
            severity: rule.severity,
            confidence: 0.9,
            affectedText: matchedText,
            startOffset: match.index,
            endOffset: match.index + matchedText.length,
            explanation: `Violation of rule "${rule.name}": Non-standard phrase "${matchedText}" used. Use the official approved phrase "${canonical}".`,
            sourceRuleId: rule.id,
            suggestedCorrection: canonical,
          });
        }

        if (regex.lastIndex === match.index) {
          regex.lastIndex++;
        }
      }
    } else {
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        const matchedText = match[0];
        const startOffset = match.index;
        const endOffset = startOffset + matchedText.length;

        let category: DeterministicFinding['category'] = 'prohibited_term';
        if (rule.ruleType === 'style_rule' || rule.ruleType === 'style') {
          category = 'style';
        } else if (rule.ruleType === 'fact_rule') {
          category = 'fact_error';
        } else if (rule.ruleType === 'accessibility') {
          category = 'accessibility';
        }

        findings.push({
          id: `det-rule-${crypto.randomUUID()}`,
          layer: 'deterministic',
          category,
          severity: rule.severity,
          confidence: 1.0,
          affectedText: matchedText,
          startOffset,
          endOffset,
          explanation: `Violation of rule "${rule.name}": Prohibited pattern "${rule.pattern}" detected.`,
          sourceRuleId: rule.id,
        });

        if (regex.lastIndex === match.index) {
          regex.lastIndex++;
        }
      }
    }
  }

  return findings;
}

/**
 * Checks content for accessibility compliance:
 * 1. Sentences > 50 words.
 * 2. Excessive capitalization (ALL CAPS words > 3 characters or blocks).
 * 3. HTML img tags missing alt attributes.
 */
export function checkAccessibility(content: string): DeterministicFinding[] {
  if (!content || !content.trim()) {
    return [];
  }

  const findings: DeterministicFinding[] = [];

  // 1. Long sentences (> 50 words)
  // Match sentences delimited by ., !, ? followed by space or end of string
  const sentenceRegex = /[^.!?\n]+(?:[.!?]+|$)/g;
  let sentenceMatch: RegExpExecArray | null;

  while ((sentenceMatch = sentenceRegex.exec(content)) !== null) {
    const rawSentence = sentenceMatch[0].trim();
    if (!rawSentence) continue;

    const words = rawSentence.split(/\s+/).filter(Boolean);
    if (words.length >= 50) {
      const startOffset = sentenceMatch.index;
      const endOffset = startOffset + sentenceMatch[0].length;

      findings.push({
        id: `det-access-${crypto.randomUUID()}`,
        layer: 'deterministic',
        category: 'accessibility',
        severity: 'medium',
        confidence: 0.95,
        affectedText: rawSentence,
        startOffset,
        endOffset,
        explanation: `Accessibility issue: Sentence contains ${words.length} words (exceeds recommended maximum of 50 words for readability). Consider breaking it into shorter sentences.`,
        suggestedCorrection: 'Break this sentence into multiple shorter sentences.',
      });
    }

    if (sentenceRegex.lastIndex === sentenceMatch.index) {
      sentenceRegex.lastIndex++;
    }
  }

  // 2. Excessive capitalization
  // A: Block of 3 or more consecutive capitalized words (e.g. "SIGN UP NOW FOR AMAZING DEALS")
  const allCapsBlockRegex = /\b[A-Z]{2,}(?:\s+[A-Z]{2,}){2,}\b/g;
  let blockMatch: RegExpExecArray | null;
  const flaggedCapsOffsets = new Set<number>();

  while ((blockMatch = allCapsBlockRegex.exec(content)) !== null) {
    const matchedText = blockMatch[0];
    const startOffset = blockMatch.index;
    const endOffset = startOffset + matchedText.length;

    flaggedCapsOffsets.add(startOffset);

    findings.push({
      id: `det-access-${crypto.randomUUID()}`,
      layer: 'deterministic',
      category: 'accessibility',
      severity: 'low',
      confidence: 0.9,
      affectedText: matchedText,
      startOffset,
      endOffset,
      explanation: `Accessibility issue: Excessive capitalization detected in "${matchedText}". ALL CAPS text can be difficult to read and screen readers may announce it letter-by-letter.`,
      suggestedCorrection: matchedText.charAt(0) + matchedText.slice(1).toLowerCase(),
    });

    if (allCapsBlockRegex.lastIndex === blockMatch.index) {
      allCapsBlockRegex.lastIndex++;
    }
  }

  // B: Individual ALL CAPS words > 3 characters (length >= 4) not in common acronyms
  const singleCapsRegex = /\b[A-Z]{4,}\b/g;
  let wordMatch: RegExpExecArray | null;

  while ((wordMatch = singleCapsRegex.exec(content)) !== null) {
    const word = wordMatch[0];
    const startOffset = wordMatch.index;
    const endOffset = startOffset + word.length;

    // Skip if already covered by a block match or in common acronyms
    const isPartOfBlock = Array.from(flaggedCapsOffsets).some(
      (blockStart) => startOffset >= blockStart && startOffset < blockStart + 100
    );

    if (!isPartOfBlock && !COMMON_ACRONYMS.has(word.toUpperCase())) {
      findings.push({
        id: `det-access-${crypto.randomUUID()}`,
        layer: 'deterministic',
        category: 'accessibility',
        severity: 'low',
        confidence: 0.85,
        affectedText: word,
        startOffset,
        endOffset,
        explanation: `Accessibility issue: Excessive capitalization detected in "${word}". Consider using title case or sentence case.`,
        suggestedCorrection: word.charAt(0) + word.slice(1).toLowerCase(),
      });
    }

    if (singleCapsRegex.lastIndex === wordMatch.index) {
      singleCapsRegex.lastIndex++;
    }
  }

  // 3. HTML img tags missing alt attribute
  const imgRegex = /<img\b(?![^>]*\balt\s*=)[^>]*>/gi;
  let imgMatch: RegExpExecArray | null;

  while ((imgMatch = imgRegex.exec(content)) !== null) {
    const matchedTag = imgMatch[0];
    const startOffset = imgMatch.index;
    const endOffset = startOffset + matchedTag.length;

    findings.push({
      id: `det-access-${crypto.randomUUID()}`,
      layer: 'deterministic',
      category: 'accessibility',
      severity: 'high',
      confidence: 1.0,
      affectedText: matchedTag,
      startOffset,
      endOffset,
      explanation: 'Accessibility issue: Image tag is missing an alt attribute. Screen readers require descriptive alt text for accessibility.',
      suggestedCorrection: matchedTag.replace(/<img\b/i, '<img alt=""'),
    });

    if (imgRegex.lastIndex === imgMatch.index) {
      imgRegex.lastIndex++;
    }
  }

  return findings;
}

/**
 * Checks if two text spans overlap.
 */
function spansOverlap(a: DeterministicFinding, b: DeterministicFinding): boolean {
  if (
    a.startOffset === undefined ||
    a.endOffset === undefined ||
    b.startOffset === undefined ||
    b.endOffset === undefined
  ) {
    return false;
  }
  return Math.max(a.startOffset, b.startOffset) < Math.min(a.endOffset, b.endOffset);
}

/**
 * Runs the complete deterministic analysis suite on content.
 * Executes all checks in sequence, deduplicates overlapping findings,
 * and sorts results by severity (critical first).
 */
export function runDeterministicAnalysis(
  content: string,
  options: DeterministicEngineOptions
): DeterministicFinding[] {
  if (!content || !content.trim()) {
    return [];
  }

  const rules = options.rules ?? [];
  const facts = options.approvedFacts ?? options.facts ?? [];
  const terms = options.terms ?? [];

  // Run all checks in sequence
  const rawFindings: DeterministicFinding[] = [
    ...checkProhibitedTerms(content, terms),
    ...checkRequiredTerms(content, terms),
    ...checkApprovedFacts(content, facts),
    ...checkBrandRules(content, rules),
    ...checkAccessibility(content),
  ];

  if (rawFindings.length === 0) {
    return [];
  }

  // Deduplicate overlapping findings
  // Higher severity or higher confidence wins when spans overlap
  const deduplicated: DeterministicFinding[] = [];

  for (const finding of rawFindings) {
    // If finding has no span, keep it directly (e.g., missing required terms)
    if (finding.startOffset === undefined || finding.endOffset === undefined) {
      deduplicated.push(finding);
      continue;
    }

    const overlapIndex = deduplicated.findIndex((existing) =>
      spansOverlap(existing, finding)
    );

    if (overlapIndex === -1) {
      deduplicated.push(finding);
    } else {
      const existing = deduplicated[overlapIndex];
      const existingWeight = SEVERITY_WEIGHT[existing.severity];
      const newWeight = SEVERITY_WEIGHT[finding.severity];

      // If new finding is more severe, replace existing
      if (newWeight < existingWeight) {
        deduplicated[overlapIndex] = finding;
      } else if (newWeight === existingWeight && finding.confidence > existing.confidence) {
        deduplicated[overlapIndex] = finding;
      }
    }
  }

  // Sort findings by severity (critical first), then by position
  return deduplicated.sort((a, b) => {
    const weightDiff = SEVERITY_WEIGHT[a.severity] - SEVERITY_WEIGHT[b.severity];
    if (weightDiff !== 0) return weightDiff;
    return (a.startOffset ?? 0) - (b.startOffset ?? 0);
  });
}
