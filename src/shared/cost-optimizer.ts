/**
 * Adaptive Complexity Classifier & Cost Optimizer
 *
 * Evaluates incoming user prompts and questions to prevent naive multi-agent token explosion.
 * Intelligently routes simple queries and surgical fixes to single-worker shortcuts, reserving
 * full multi-agent swarms exclusively for complex, multi-system initiatives.
 */

export interface ComplexityReport {
  score: number; // 1 (simplest question) to 10 (massive multi-system overhaul)
  recommendedMode: 'single' | 'pair' | 'swarm';
  isQuestion: boolean;
  isMinorEdit: boolean;
  tokenProjection: {
    singleWorkerTokens: number;
    swarmTokens: number;
    estimatedSavingsPercent: number;
    estimatedCostDeltaUsd: number;
    singleCostUsd: number;
    swarmCostUsd: number;
  };
  reasoning: string[];
}

export class ComplexityGate {
  private static readonly QUESTION_REGEX = /^(what|how|why|when|where|who|explain|show|describe|is there|can you|could you|does|do|will|should)\b/i;
  private static readonly REFACTOR_KEYWORDS = /\b(refactor|overhaul|migrate|migration|redesign|architect|full-stack|fullstack|multi-agent|distributed|ecosystem|rewrite)\b/i;
  private static readonly MINOR_EDIT_KEYWORDS = /\b(typo|comment|lint|rename|formatting|format|readme|css|color|padding|margin|font|align|spelling|minor|quick fix|tweak)\b/i;
  private static readonly SYSTEM_KEYWORDS = /\b(database|backend|frontend|api|rest|websocket|auth|security|testing|e2e)\b/gi;

  /**
   * Evaluates prompt text and context scope to produce an objective complexity score and cost prediction.
   */
  public static analyze(prompt: string, trackedFileCount = 10): ComplexityReport {
    const text = prompt.trim();
    if (!text) {
      return {
        score: 1,
        recommendedMode: 'single',
        isQuestion: false,
        isMinorEdit: false,
        tokenProjection: {
          singleWorkerTokens: 5_000,
          swarmTokens: 40_000,
          estimatedSavingsPercent: 88,
          estimatedCostDeltaUsd: 0.105,
          singleCostUsd: 0.015,
          swarmCostUsd: 0.12,
        },
        reasoning: ['Empty prompt defaults to minimal execution'],
      };
    }

    const isQuestion = this.QUESTION_REGEX.test(text) || text.endsWith('?');
    const hasRefactor = this.REFACTOR_KEYWORDS.test(text);
    const hasMinor = this.MINOR_EDIT_KEYWORDS.test(text);
    const systemMatches = text.match(this.SYSTEM_KEYWORDS) ?? [];
    const uniqueSystems = new Set(systemMatches.map((s) => s.toLowerCase())).size;

    let score = 5;
    const reasoning: string[] = [];

    if (isQuestion && !hasRefactor) {
      score -= 3;
      reasoning.push('Informational question detected (best answered by single worker)');
    }
    if (hasMinor && !hasRefactor) {
      score -= 2;
      reasoning.push('Targeted surgical edit or styling fix detected');
    }
    if (hasRefactor) {
      score += 3;
      reasoning.push('Comprehensive architectural or refactoring scope identified');
    }
    if (uniqueSystems >= 3) {
      score += 2;
      reasoning.push(`Cross-domain coordination needed across ${uniqueSystems} distinct layers`);
    } else if (uniqueSystems === 0 && !hasRefactor) {
      score -= 1;
    }

    if (text.length > 500) {
      score += 1;
      reasoning.push('Detailed multi-requirement prompt specification');
    }

    score = Math.max(1, Math.min(10, score));

    const recommendedMode: 'single' | 'pair' | 'swarm' =
      score <= 3 ? 'single' : score <= 6 ? 'pair' : 'swarm';

    // Model token projection based on empirical benchmarks
    const singleTokens = 6_000 + score * 2_000;
    const swarmTokens = 45_000 + score * 14_000;
    const savingsPercent = Math.max(0, Math.round(((swarmTokens - singleTokens) / swarmTokens) * 100));

    // Pricing benchmark: $3.00 per 1M blended input/output tokens
    const singleCostUsd = Number(((singleTokens / 1_000_000) * 3.0).toFixed(4));
    const swarmCostUsd = Number(((swarmTokens / 1_000_000) * 3.0).toFixed(4));
    const estimatedCostDeltaUsd = Number((swarmCostUsd - singleCostUsd).toFixed(4));

    return {
      score,
      recommendedMode,
      isQuestion,
      isMinorEdit: hasMinor,
      tokenProjection: {
        singleWorkerTokens: singleTokens,
        swarmTokens,
        estimatedSavingsPercent: savingsPercent,
        estimatedCostDeltaUsd,
        singleCostUsd,
        swarmCostUsd,
      },
      reasoning,
    };
  }

  /**
   * Generates a concise human-readable cost optimization banner text.
   */
  public static formatCostAdvisory(report: ComplexityReport): string {
    if (report.recommendedMode === 'single') {
      return `💡 Cost Advisory: ${report.reasoning[0] ?? 'Low-complexity task'}. A single worker will complete this for ~${Math.round(report.tokenProjection.singleWorkerTokens / 1000)}k tokens ($${report.tokenProjection.singleCostUsd.toFixed(2)}) vs ~${Math.round(report.tokenProjection.swarmTokens / 1000)}k tokens ($${report.tokenProjection.swarmCostUsd.toFixed(2)}) in a full swarm (${report.tokenProjection.estimatedSavingsPercent}% savings).`;
    }
    if (report.recommendedMode === 'pair') {
      return `⚡ Dual Worker Recommended: Moderate scope. Running as a Maker + QA pair is optimal before escalating to a full multi-agent swarm.`;
    }
    return `🐝 Autonomous Swarm Justified: High complexity (${report.score}/10) across multiple systems. Parallel worktrees will maximize execution velocity.`;
  }
}
