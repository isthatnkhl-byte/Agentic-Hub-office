import type { MeetingStatus, MeetingSwarmTask, SwarmRole, SwarmTaskStatus } from '../../shared/protocol';
import { SWARM_ROLE_PROFILES } from '../../shared/meetings';

export interface DagNodeLayout {
  task: MeetingSwarmTask;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
}

export interface DagEdgeLayout {
  fromTask: string;
  toTask: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface SwarmDagGraph {
  nodes: DagNodeLayout[];
  edges: DagEdgeLayout[];
  totalLayers: number;
}

export const ROLE_THEMES: Record<SwarmRole, { label: string; icon: string; bg: string; border: string; ink: string }> = {
  frontend: { label: 'Frontend', icon: '🎨', bg: '#e7f5ff', border: '#74c0fc', ink: '#1864ab' },
  backend: { label: 'Backend', icon: '⚙️', bg: '#f3f0ff', border: '#b197fc', ink: '#5f3dc4' },
  testing: { label: 'QA / Test', icon: '🧪', bg: '#ebfbee', border: '#8ce99a', ink: '#2b8a3e' },
  security: { label: 'Security', icon: '🛡️', bg: '#fff5f5', border: '#ffa8a8', ink: '#c92a2a' },
  documentation: { label: 'Docs', icon: '📚', bg: '#fff9db', border: '#ffe066', ink: '#e67700' },
  general: { label: 'General', icon: '⚡', bg: '#f8f9fa', border: '#ced4da', ink: '#495057' },
};

export const STATUS_THEMES: Record<SwarmTaskStatus, { label: string; icon: string; bg: string; ink: string }> = {
  done: { label: 'DONE', icon: '✅', bg: '#d3f9d8', ink: '#2b8a3e' },
  running: { label: 'RUNNING', icon: '⌨️', bg: '#fff3bf', ink: '#d9480f' },
  queued: { label: 'QUEUED', icon: '⏳', bg: '#d0ebff', ink: '#1864ab' },
  blocked: { label: 'BLOCKED', icon: '🔒', bg: '#e9ecef', ink: '#495057' },
  failed: { label: 'FAILED', icon: '❌', bg: '#ffe3e3', ink: '#c92a2a' },
  cancelled: { label: 'CANCELLED', icon: '⛔', bg: '#e9ecef', ink: '#868e96' },
};

/** Computes topological layers and coordinates for swarm tasks */
export function computeDagLayout(tasks: MeetingSwarmTask[], canvasWidth: number, canvasHeight: number, topPadding = 110, bottomPadding = 40): SwarmDagGraph {
  if (tasks.length === 0) return { nodes: [], edges: [], totalLayers: 0 };

  const taskMap = new Map<string, MeetingSwarmTask>(tasks.map((t) => [t.id, t]));
  const layerMap = new Map<string, number>();

  // Determine layers: a node's layer is 1 + max(layer of dependencies)
  function getLayer(id: string, visited: Set<string> = new Set()): number {
    if (layerMap.has(id)) return layerMap.get(id)!;
    if (visited.has(id)) return 0; // Guard against cycles
    visited.add(id);

    const task = taskMap.get(id);
    if (!task || !task.dependsOn || task.dependsOn.length === 0) {
      layerMap.set(id, 0);
      return 0;
    }

    let maxPrereq = -1;
    for (const depId of task.dependsOn) {
      if (taskMap.has(depId)) {
        maxPrereq = Math.max(maxPrereq, getLayer(depId, visited));
      }
    }
    const layer = maxPrereq + 1;
    layerMap.set(id, layer);
    return layer;
  }

  for (const t of tasks) getLayer(t.id);

  // Group tasks by layer
  const layers: MeetingSwarmTask[][] = [];
  for (const t of tasks) {
    const l = layerMap.get(t.id) ?? 0;
    while (layers.length <= l) layers.push([]);
    layers[l].push(t);
  }

  const totalLayers = Math.max(1, layers.length);
  const usableWidth = canvasWidth - 80;
  const usableHeight = canvasHeight - topPadding - bottomPadding;

  const colWidth = usableWidth / totalLayers;
  const nodeWidth = Math.max(180, Math.min(260, colWidth - 36));

  const nodes: DagNodeLayout[] = [];
  const nodePosMap = new Map<string, { x: number; y: number; w: number; h: number }>();

  for (let l = 0; l < layers.length; l++) {
    const colTasks = layers[l];
    const n = colTasks.length;
    const nodeHeight = Math.max(70, Math.min(100, (usableHeight - (n - 1) * 20) / Math.max(1, n)));
    const totalH = n * nodeHeight + (n - 1) * 20;
    const startY = topPadding + (usableHeight - totalH) / 2;
    const colCenterX = 40 + l * colWidth + colWidth / 2;

    for (let i = 0; i < n; i++) {
      const task = colTasks[i];
      const x = colCenterX - nodeWidth / 2;
      const y = startY + i * (nodeHeight + 20);
      const layoutNode: DagNodeLayout = { task, x, y, width: nodeWidth, height: nodeHeight, layer: l };
      nodes.push(layoutNode);
      nodePosMap.set(task.id, { x, y, w: nodeWidth, h: nodeHeight });
    }
  }

  // Generate connecting edges
  const edges: DagEdgeLayout[] = [];
  for (const task of tasks) {
    const target = nodePosMap.get(task.id);
    if (!target) continue;
    for (const depId of task.dependsOn) {
      const source = nodePosMap.get(depId);
      if (!source) continue;
      edges.push({
        fromTask: depId,
        toTask: task.id,
        fromX: source.x + source.w,
        fromY: source.y + source.h / 2,
        toX: target.x,
        toY: target.y + target.h / 2,
      });
    }
  }

  return { nodes, edges, totalLayers };
}

/** Renders high-fidelity Swarm DAG graph onto an HTML 2D canvas */
export function renderSwarmDag(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: {
    title?: string;
    status?: MeetingStatus;
    tasks: MeetingSwarmTask[];
    tokens?: number;
    budget?: number;
    cost?: number;
  },
) {
  const { title = 'Autonomous Multi-Agent Swarm', status = 'running', tasks = [], tokens = 0, budget = 10_000_000, cost = 0 } = data;

  // Background styling: sleek blueprint whiteboard grid
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Subtle grid dots
  ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
  const gridStep = 40;
  for (let gx = 20; gx < width; gx += gridStep) {
    for (let gy = 20; gy < height; gy += gridStep) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Top header bar
  const headerH = 75;
  const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
  headerGrad.addColorStop(0, '#1e293b');
  headerGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, width, headerH);

  // Header Title & Icon
  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 28px Nunito, ui-rounded, system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(`🐝 ${title}`, 24, 38);

  // Progress computation
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const runningTasks = tasks.filter((t) => t.status === 'running').length;
  const progressRatio = totalTasks > 0 ? doneTasks / totalTasks : 0;
  const pct = Math.round(progressRatio * 100);

  // Progress Bar in Header
  const barW = 220;
  const barH = 14;
  const barX = width - barW - 240;
  const barY = 31;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 7);
  ctx.fill();

  if (progressRatio > 0) {
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW * progressRatio, 0);
    fillGrad.addColorStop(0, '#22c55e');
    fillGrad.addColorStop(1, '#16a34a');
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * progressRatio, barH, 7);
    ctx.fill();
  }

  // Progress Text
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '700 18px Nunito, ui-rounded, system-ui, sans-serif';
  ctx.fillText(`${doneTasks}/${totalTasks} Tasks · ${pct}%`, barX - 170, 38);

  // Status Badge
  const statusColor = status === 'done' ? '#16a34a' : status === 'running' ? '#f59e0b' : status === 'partial' ? '#eab308' : '#ef4444';
  const statusText = status === 'done' ? '✅ COMPLETED' : status === 'running' ? '⚡ SWARM ACTIVE' : status === 'partial' ? '⚠️ PARTIAL' : '⛔ STOPPED';
  ctx.fillStyle = statusColor;
  ctx.beginPath();
  ctx.roundRect(width - 210, 18, 186, 38, 19);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 16px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(statusText, width - 117, 38);

  // Compute and draw DAG Graph
  const graph = computeDagLayout(tasks, width, height, headerH + 30, 45);

  // Draw Edges (curved connector arrows)
  ctx.lineWidth = 2.5;
  for (const edge of graph.edges) {
    const dx = edge.toX - edge.fromX;
    const midX = edge.fromX + dx / 2;

    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(edge.fromX, edge.fromY);
    ctx.bezierCurveTo(midX, edge.fromY, midX, edge.toY, edge.toX, edge.toY);
    ctx.stroke();

    // Arrowhead
    const arrowSize = 6;
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(edge.toX, edge.toY);
    ctx.lineTo(edge.toX - arrowSize * 1.5, edge.toY - arrowSize);
    ctx.lineTo(edge.toX - arrowSize * 1.5, edge.toY + arrowSize);
    ctx.closePath();
    ctx.fill();
  }

  // Draw Nodes (Task Cards)
  for (const node of graph.nodes) {
    const { task, x, y, width: nw, height: nh } = node;
    const roleTheme = ROLE_THEMES[task.role] ?? ROLE_THEMES.general;
    const statusTheme = STATUS_THEMES[task.status] ?? STATUS_THEMES.queued;

    // Card background & shadow
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.roundRect(x, y, nw, nh, 10);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Status-colored border
    ctx.strokeStyle = task.status === 'running' ? '#f59e0b' : task.status === 'done' ? '#22c55e' : roleTheme.border;
    ctx.lineWidth = task.status === 'running' ? 2.5 : 1.5;
    ctx.stroke();

    // Top role strip
    const stripH = 26;
    ctx.fillStyle = roleTheme.bg;
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, nw - 2, stripH, [9, 9, 0, 0]);
    ctx.fill();

    // Role text
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '800 13px Nunito, ui-rounded, system-ui, sans-serif';
    ctx.fillStyle = roleTheme.ink;
    ctx.fillText(`${roleTheme.icon} ${roleTheme.label.toUpperCase()}`, x + 10, y + stripH / 2 + 1);

    // Status pill
    ctx.textAlign = 'right';
    ctx.font = '800 12px ui-monospace, Menlo, monospace';
    ctx.fillStyle = statusTheme.ink;
    ctx.fillText(`${statusTheme.icon} ${statusTheme.label}`, x + nw - 10, y + stripH / 2 + 1);

    // Agent name / title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 16px Nunito, ui-rounded, system-ui, sans-serif';
    const nameText = task.agentName || task.id;
    ctx.fillText(nameText.length > 22 ? nameText.slice(0, 21) + '…' : nameText, x + 12, y + stripH + 20);

    // Provider / Model line
    ctx.font = '600 12px ui-monospace, Menlo, monospace';
    ctx.fillStyle = '#64748b';
    const providerTag = task.provider === 'antigravity' ? '🪐 Antigravity' : task.provider === 'claude' ? 'Claude' : task.provider;
    const modelTag = task.model ? ` (${task.model})` : '';
    ctx.fillText(`${providerTag}${modelTag}`, x + 12, y + stripH + 40);

    // Running pulse indicator
    if (task.status === 'running') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x + nw - 16, y + stripH + 22, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Footer bar with Swarm Telemetry
  const footerH = 34;
  const footerY = height - footerH;
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, footerY, width, footerH);

  ctx.fillStyle = '#475569';
  ctx.font = '700 14px ui-monospace, Menlo, monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const tokenFmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}k` : `${n}`);
  const telemetry = `⚡ DAG Nodes: ${totalTasks} | Active: ${runningTasks} | Completed: ${doneTasks} | Spend: ${tokenFmt(tokens)} / ${tokenFmt(budget)} tokens${cost > 0 ? ` · $${cost.toFixed(2)}` : ''}`;
  ctx.fillText(telemetry, 24, footerY + footerH / 2);

  ctx.textAlign = 'right';
  ctx.fillText('Autonomous Swarm Engine · Real-time Workspace Topology', width - 24, footerY + footerH / 2);
}
