// Interactive 2D Swarm DAG Modal: visualizes the autonomous multi-agent DAG,
// topological dependency layers, Git worktree branch chains, and provides
// live terminal jump links for all assigned agents.

import type { Meeting, MeetingSwarmTask, SwarmTaskStatus } from '../../shared/protocol';
import { fmtCost, fmtTokens } from '../../shared/protocol';
import { computeDagLayout, renderSwarmDag, ROLE_THEMES, STATUS_THEMES } from '../world/swarm-dag-render';
import type { Net } from '../net';
import { store } from '../state';
import { h, openModal, toast, type Modal } from './dom';

export interface SwarmDagModalActions {
  openTerminal?: (workerId: string) => void;
  openMeeting?: () => void;
}

export function openSwarmDagModal(meeting: Meeting, net: Net, actions: SwarmDagModalActions = {}): Modal {
  const tasks = meeting.swarmTasks ?? [];
  let currentTab: 'graph' | 'cards' = 'graph';

  const closeBtn = h('button.btn.close', { 'aria-label': 'Close', title: 'Close (Esc)' }, '✕');

  // Tab buttons
  const btnGraph = h('button.btn.tab-btn.active', { type: 'button' }, '📊 Topology Graph');
  const btnCards = h('button.btn.tab-btn', { type: 'button' }, `📋 Task Cards (${tasks.length})`);

  const tabsBar = h('div.swarm-tabs', {}, btnGraph, btnCards);

  // Status Badge
  const statusTheme = STATUS_THEMES[meeting.status as SwarmTaskStatus] ?? { label: meeting.status.toUpperCase(), icon: '⚡', bg: '#f1f5f9', ink: '#334155' };
  const statusPill = h(
    'span.pill',
    { style: `background: ${statusTheme.bg}; color: ${statusTheme.ink}; font-weight: 800; border: 1.5px solid ${statusTheme.ink}` },
    `${statusTheme.icon} ${meeting.status.toUpperCase()}`,
  );

  const header = h(
    'header.swarm-modal-header',
    {},
    h('div.swarm-modal-title-row', {},
      h('h2', {}, `🐝 ${meeting.title || 'Autonomous Swarm Execution'}`),
      statusPill,
      tabsBar,
      closeBtn,
    ),
  );

  // Telemetry Bar
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const runningTasks = tasks.filter((t) => t.status === 'running').length;
  const queuedTasks = tasks.filter((t) => t.status === 'queued').length;
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;
  const failedTasks = tasks.filter((t) => t.status === 'failed').length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const progressBarInner = h('div.swarm-progress-bar-fill', {
    style: `width: ${progressPct}%; background: ${progressPct === 100 ? '#16a34a' : progressPct > 60 ? '#22c55e' : '#eab308'};`,
  });
  const progressBar = h('div.swarm-progress-bar', {}, progressBarInner);

  const statsRow = h(
    'div.swarm-stats-row',
    {},
    h('div.swarm-stat', {}, h('span.label', {}, 'Progress:'), h('b', {}, `${doneTasks}/${totalTasks} Tasks (${progressPct}%)`)),
    h('div.swarm-stat', {}, h('span.label', {}, 'Active:'), h('b', { style: 'color: #ea580c;' }, `⌨️ ${runningTasks} Running`)),
    h('div.swarm-stat', {}, h('span.label', {}, 'Queued:'), h('b', { style: 'color: #0284c7;' }, `⏳ ${queuedTasks}`)),
    blockedTasks > 0 ? h('div.swarm-stat', {}, h('span.label', {}, 'Blocked:'), h('b', { style: 'color: #64748b;' }, `🔒 ${blockedTasks}`)) : null,
    failedTasks > 0 ? h('div.swarm-stat', {}, h('span.label', {}, 'Failed:'), h('b', { style: 'color: #dc2626;' }, `❌ ${failedTasks}`)) : null,
    h('div.swarm-stat', {}, h('span.label', {}, 'Tokens:'), h('b', {}, `${fmtTokens(meeting.tokens)} / ${fmtTokens(meeting.budget)}`)),
    meeting.costKnown && meeting.cost ? h('div.swarm-stat', {}, h('span.label', {}, 'Cost:'), h('b', {}, fmtCost(meeting.cost))) : null,
    meeting.swarmLimit ? h('div.swarm-stat', {}, h('span.label', {}, 'Concurrency Cap:'), h('b', {}, `${meeting.swarmLimit} workers`)) : null,
  );

  const telemetryContainer = h('div.swarm-telemetry-container', {}, progressBar, statsRow);

  // Content Hosts
  const graphHost = h('div.swarm-graph-host', {});
  const cardsHost = h('div.swarm-cards-host.hidden', {});

  // Canvas for Graph View
  const canvas = document.createElement('canvas');
  canvas.className = 'swarm-dag-canvas';
  canvas.width = 1200;
  canvas.height = 700;
  graphHost.append(canvas);

  function drawCanvas() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderSwarmDag(ctx, canvas.width, canvas.height, {
      title: meeting.title,
      status: meeting.status,
      tasks: meeting.swarmTasks ?? [],
      tokens: meeting.tokens,
      budget: meeting.budget,
      cost: meeting.cost,
    });
  }

  // Draw initial canvas
  setTimeout(() => drawCanvas(), 20);

  // Build Layer-by-layer Cards View
  function buildCardsView() {
    cardsHost.replaceChildren();
    if (tasks.length === 0) {
      cardsHost.append(h('p.empty', {}, 'No swarm tasks generated yet.'));
      return;
    }

    const graph = computeDagLayout(tasks, 1200, 700);
    const layerMap = new Map<number, MeetingSwarmTask[]>();
    for (const node of graph.nodes) {
      const list = layerMap.get(node.layer) ?? [];
      list.push(node.task);
      layerMap.set(node.layer, list);
    }

    const sortedLayers = Array.from(layerMap.keys()).sort((a, b) => a - b);

    for (const layerIdx of sortedLayers) {
      const layerTasks = layerMap.get(layerIdx) ?? [];
      const layerTitle = layerIdx === 0
        ? 'Layer 0: Root Tasks (Prerequisites)'
        : layerIdx === sortedLayers.length - 1 && sortedLayers.length > 2
          ? `Layer ${layerIdx}: Final Integration & Verification`
          : `Layer ${layerIdx}: Dependent Tasks`;

      const layerHeader = h('div.swarm-layer-header', {},
        h('h3', {}, layerTitle),
        h('span.badge', {}, `${layerTasks.length} task${layerTasks.length === 1 ? '' : 's'}`),
      );

      const cardsGrid = h('div.swarm-cards-grid', {},
        ...layerTasks.map((task) => renderTaskCard(task, actions, meeting)),
      );

      cardsHost.append(h('div.swarm-layer-section', {}, layerHeader, cardsGrid));
    }
  }

  buildCardsView();

  // Tab switching
  btnGraph.onclick = () => {
    currentTab = 'graph';
    btnGraph.classList.add('active');
    btnCards.classList.remove('active');
    graphHost.classList.remove('hidden');
    cardsHost.classList.add('hidden');
    drawCanvas();
  };

  btnCards.onclick = () => {
    currentTab = 'cards';
    btnCards.classList.add('active');
    btnGraph.classList.remove('active');
    cardsHost.classList.remove('hidden');
    graphHost.classList.add('hidden');
    buildCardsView();
  };

  // Footer Actions
  const footer = h(
    'footer.swarm-modal-footer',
    {},
    h('span.grow', {}, meeting.status === 'running' ? '⚡ Autonomous Swarm is executing tasks across available office desks.' : 'Swarm execution finished. Worktrees preserved for review.'),
    meeting.status === 'running'
      ? h('button.btn', {
          type: 'button',
          onclick: () => {
            if (confirm('Stop the swarm? Active workers will finish their current command and exit.')) {
              net.send({ t: 'meeting.stop' });
              toast('Stopping swarm meeting…', 'warn');
              modal.close();
            }
          },
        }, '⛔ Stop Swarm')
      : null,
    actions.openMeeting
      ? h('button.btn.primary', {
          type: 'button',
          onclick: () => {
            modal.close();
            actions.openMeeting!();
          },
        }, '🤝 Conference Room')
      : null,
    h('button.btn', { type: 'button', onclick: () => modal.close() }, 'Close'),
  );

  const container = h(
    'div.modal.swarm-dag-modal',
    { role: 'dialog', 'aria-label': 'Autonomous Swarm DAG' },
    header,
    telemetryContainer,
    graphHost,
    cardsHost,
    footer,
  );

  const modal = openModal(container, {
    escCloses: true,
    doing: `🐝 viewing swarm: ${meeting.title}`,
  });

  closeBtn.onclick = () => modal.close();

  return modal;
}

function renderTaskCard(task: MeetingSwarmTask, actions: SwarmDagModalActions, meeting: Meeting): HTMLElement {
  const roleTheme = ROLE_THEMES[task.role] ?? { label: task.role, icon: '⚡', bg: '#f8f9fa', border: '#ced4da', ink: '#495057' };
  const taskStatusTheme = STATUS_THEMES[task.status] ?? { label: task.status, icon: '•', bg: '#f1f5f9', ink: '#334155' };

  const roleBadge = h(
    'span.swarm-role-chip',
    { style: `background: ${roleTheme.bg}; color: ${roleTheme.ink}; border: 1.5px solid ${roleTheme.border};` },
    `${roleTheme.icon} ${roleTheme.label}`,
  );

  const statusBadge = h(
    'span.swarm-status-chip',
    { style: `background: ${taskStatusTheme.bg}; color: ${taskStatusTheme.ink}; font-weight: 800;` },
    `${taskStatusTheme.icon} ${taskStatusTheme.label}`,
  );

  const worker = task.workerId ? store.workers.get(task.workerId) : undefined;

  const cardHeader = h(
    'div.swarm-card-header',
    {},
    h('b.swarm-card-title', {}, task.agentName),
    roleBadge,
    statusBadge,
  );

  const desc = h('div.swarm-card-work', {}, task.work);

  const metaItems = [
    h('span.meta-item', {}, `⚙️ ${task.provider}${task.model ? ` · ${task.model}` : ''}`),
    task.branch ? h('span.meta-item', {}, `🌿 ${task.branch}`) : null,
    task.dependsOn.length ? h('span.meta-item', {}, `🔗 After: ${task.dependsOn.join(', ')}`) : null,
  ].filter(Boolean);

  const metaRow = h('div.swarm-card-meta', {}, ...metaItems);

  // Criteria
  let criteriaList: HTMLElement | null = null;
  if (task.acceptanceCriteria?.length) {
    criteriaList = h(
      'details.swarm-criteria',
      {},
      h('summary', {}, `Acceptance criteria (${task.acceptanceCriteria.length})`),
      h('ul', {}, ...task.acceptanceCriteria.map((c) => h('li', {}, c))),
    );
  }

  // Action buttons (Terminal, etc.)
  const actionRow = h('div.swarm-card-actions', {});
  if (worker && actions.openTerminal) {
    actionRow.append(
      h('button.btn.small.primary', {
        type: 'button',
        onclick: () => actions.openTerminal!(worker.id),
      }, '🖥️ Open Terminal'),
    );
  }

  return h(
    'div.swarm-task-card',
    { class: `status-${task.status}` },
    cardHeader,
    desc,
    criteriaList,
    metaRow,
    actionRow.children.length ? actionRow : null,
  );
}
