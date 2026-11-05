import { describe, it, expect } from 'vitest';
import {
  runDeterministicAnalysis,
  checkProhibitedTerms,
  checkApprovedFacts,
} from '../../engine/deterministic';

const mockRules = [
  {
    id: 'r1',
    ruleType: 'prohibited_term',
    name: 'No guaranteed returns',
    pattern: 'guaranteed (returns?|profits?)',
    severity: 'critical' as const,
    isActive: true,
  },
  {
    id: 'r2',
    ruleType: 'prohibited_term',
    name: 'No risk-free',
    pattern: 'risk[- ]free',
    severity: 'critical' as const,
    isActive: true,
  },
  {
    id: 'r3',
    ruleType: 'prohibited_term',
    name: 'No NF abbreviation',
    pattern: '\\bNF\\b',
    severity: 'medium' as const,
    isActive: true,
  },
];

const mockFacts = [
  {
    id: 'f1',
    category: 'savings_rate',
    claim: 'APY',
    value: '4.75',
    unit: '%',
    isActive: true,
  },
  {
    id: 'f2',
    category: 'approval_rate',
    claim: 'approval rate',
    value: '89',
    unit: '%',
    isActive: true,
  },
];

const mockTerms = [
  {
    id: 't1',
    term: 'online savings account',
    termType: 'prohibited' as const,
    preferredAlternative: 'digital savings account',
  },
  {
    id: 't2',
    term: 'guaranteed',
    termType: 'prohibited' as const,
  },
  {
    id: 't3',
    term: 'customers',
    termType: 'prohibited' as const,
    preferredAlternative: 'members',
  },
];

describe('Deterministic Analysis Engine', () => {
  describe('checkProhibitedTerms', () => {
    it('flags prohibited terms correctly', () => {
      const findings = checkProhibitedTerms(
        'We offer guaranteed returns for all customers',
        mockTerms,
      );
      expect(
        findings.some((f) => f.affectedText.toLowerCase().includes('guaranteed')),
      ).toBe(true);
    });

    it('does not flag approved terms', () => {
      const findings = checkProhibitedTerms(
        'Open a digital savings account today',
        mockTerms,
      );
      expect(findings.length).toBe(0);
    });

    it('suggests preferred alternative', () => {
      const findings = checkProhibitedTerms(
        'Join our online savings account program',
        mockTerms,
      );
      const finding = findings.find((f) =>
        f.affectedText.toLowerCase().includes('online savings'),
      );
      expect(finding?.suggestedCorrection).toContain('digital savings account');
    });

    it('is case-insensitive', () => {
      const findings = checkProhibitedTerms('CUSTOMERS love our product', mockTerms);
      expect(findings.some((f) => f.category === 'prohibited_term')).toBe(true);
    });

    it('handles empty terms list gracefully', () => {
      const findings = checkProhibitedTerms('Some random text', []);
      expect(findings).toEqual([]);
    });
  });

  describe('Brand Rules', () => {
    it('flags guaranteed returns (critical violation)', () => {
      const result = runDeterministicAnalysis('Earn guaranteed returns today', {
        rules: mockRules,
        approvedFacts: mockFacts,
        terms: [],
      });
      const critical = result.filter((f) => f.severity === 'critical');
      expect(critical.length).toBeGreaterThan(0);
    });

    it('flags risk-free claims', () => {
      const result = runDeterministicAnalysis('Invest risk-free with us', {
        rules: mockRules,
        approvedFacts: mockFacts,
        terms: [],
      });
      expect(result.some((f) => f.affectedText.toLowerCase().includes('risk'))).toBe(
        true,
      );
    });

    it('flags NF abbreviation', () => {
      const result = runDeterministicAnalysis('The NF app is available on iOS', {
        rules: mockRules,
        approvedFacts: mockFacts,
        terms: [],
      });
      expect(result.some((f) => f.affectedText === 'NF')).toBe(true);
    });

    it('does not flag clean content', () => {
      const result = runDeterministicAnalysis(
        'Open a digital savings account with Nova Financial today.',
        { rules: mockRules, approvedFacts: mockFacts, terms: [] },
      );
      expect(result.filter((f) => f.severity === 'critical').length).toBe(0);
    });

    it('handles multiple violations in one text', () => {
      const result = runDeterministicAnalysis(
        'Earn guaranteed returns risk-free with NF',
        { rules: mockRules, approvedFacts: mockFacts, terms: [] },
      );
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('ignores inactive rules when isActive is false', () => {
      const inactiveRule = {
        id: 'r4',
        ruleType: 'prohibited_term',
        name: 'Inactive rule',
        pattern: 'forbiddenphrase',
        severity: 'critical' as const,
        isActive: false,
      };
      const result = runDeterministicAnalysis('This contains forbiddenphrase', {
        rules: [inactiveRule],
        approvedFacts: [],
        terms: [],
      });
      expect(result.length).toBe(0);
    });

    it('accurately computes startOffset and endOffset for findings', () => {
      const content = 'Earn guaranteed returns';
      const result = runDeterministicAnalysis(content, {
        rules: mockRules,
        approvedFacts: [],
        terms: [],
      });
      const finding = result.find((f) => f.affectedText.includes('guaranteed'));
      expect(finding).toBeDefined();
      if (
        finding &&
        finding.startOffset !== undefined &&
        finding.endOffset !== undefined
      ) {
        expect(content.slice(finding.startOffset, finding.endOffset)).toEqual(
          finding.affectedText,
        );
      }
    });
  });

  describe('Fact Checking', () => {
    it('flags APY higher than approved value', () => {
      const result = runDeterministicAnalysis('Earn 6.5% APY on your savings', {
        rules: [],
        approvedFacts: mockFacts,
        terms: [],
      });
      expect(result.some((f) => f.category === 'fact_error')).toBe(true);
    });

    it('does not flag correct APY', () => {
      const result = runDeterministicAnalysis(
        'Earn 4.75% APY on your digital savings account',
        { rules: [], approvedFacts: mockFacts, terms: [] },
      );
      expect(result.filter((f) => f.category === 'fact_error').length).toBe(0);
    });

    it('flags incorrect approval rate', () => {
      const result = runDeterministicAnalysis(
        'With a 95% approval rate, almost everyone qualifies',
        { rules: [], approvedFacts: mockFacts, terms: [] },
      );
      expect(result.some((f) => f.category === 'fact_error')).toBe(true);
    });

    it('flags unsupported percentage claims', () => {
      const result = runDeterministicAnalysis(
        'Our product has a 99% satisfaction rate',
        { rules: [], approvedFacts: mockFacts, terms: [] },
      );
      // Should flag unverified claim
      expect(result.length).toBeGreaterThan(0);
    });

    it('uses checkApprovedFacts directly to detect factual mismatches', () => {
      const findings = checkApprovedFacts(
        'Our digital savings offers 7.5% APY',
        mockFacts,
      );
      expect(findings.some((f) => f.category === 'fact_error')).toBe(true);
    });
  });

  describe('Accessibility Checks', () => {
    it('flags excessively long sentences', () => {
      const longSentence =
        'This is a very long sentence that goes on and on and on and contains way too many words and should be flagged by the accessibility checker because it is simply too long for most readers to comfortably read and understand without losing track of the main point being made.';
      const result = runDeterministicAnalysis(longSentence, {
        rules: [],
        approvedFacts: [],
        terms: [],
      });
      expect(result.some((f) => f.category === 'accessibility')).toBe(true);
    });

    it('flags excessive capitalization', () => {
      const result = runDeterministicAnalysis('SIGN UP NOW FOR AMAZING DEALS', {
        rules: [],
        approvedFacts: [],
        terms: [],
      });
      expect(result.some((f) => f.category === 'accessibility')).toBe(true);
    });

    it('does not flag normal mixed-case text', () => {
      const result = runDeterministicAnalysis(
        'Sign up now for amazing deals with Nova Financial.',
        { rules: [], approvedFacts: [], terms: [] },
      );
      const accessibilityFindings = result.filter(
        (f) => f.category === 'accessibility',
      );
      expect(accessibilityFindings.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      const result = runDeterministicAnalysis('', {
        rules: mockRules,
        approvedFacts: mockFacts,
        terms: mockTerms,
      });
      expect(result).toEqual([]);
    });

    it('handles content with only whitespace', () => {
      const result = runDeterministicAnalysis('   \n\t  ', {
        rules: mockRules,
        approvedFacts: mockFacts,
        terms: mockTerms,
      });
      expect(result).toEqual([]);
    });

    it('handles special regex characters in content', () => {
      expect(() =>
        runDeterministicAnalysis('Price: $100 (discount 50%)', {
          rules: mockRules,
          approvedFacts: mockFacts,
          terms: mockTerms,
        }),
      ).not.toThrow();
    });

    it('correctly identifies corrected content', () => {
      const correctedContent =
        'Earn 4.75% APY on your digital savings account as a Nova Financial member. All investments carry risk and past performance does not guarantee future results.';
      const result = runDeterministicAnalysis(correctedContent, {
        rules: mockRules,
        approvedFacts: mockFacts,
        terms: mockTerms,
      });
      expect(result.filter((f) => f.severity === 'critical').length).toBe(0);
    });

    it('handles text with emojis and unicode characters', () => {
      expect(() =>
        runDeterministicAnalysis(
          '🔥 Amazing rates! Earn 4.75% APY with Nova Financial 👍',
          {
            rules: mockRules,
            approvedFacts: mockFacts,
            terms: mockTerms,
          },
        ),
      ).not.toThrow();
    });
  });
});
