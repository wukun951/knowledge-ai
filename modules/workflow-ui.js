(function attachWorkflowUI(global) {
  "use strict";
  if (!global || !global.document) return;

  const CATEGORY_LABELS = {
    "ai-foundations": { zh: "AI 基础", en: "AI foundations" },
    research: { zh: "研究与资料", en: "Research" },
    writing: { zh: "写作与内容", en: "Writing" },
    "product-analysis": { zh: "产品分析", en: "Product analysis" },
    "industrial-design": { zh: "工业设计", en: "Industrial design" },
    "visual-design": { zh: "视觉设计", en: "Visual design" },
    "image-generation": { zh: "图像生成", en: "Image generation" },
    "video-generation": { zh: "视频生成", en: "Video generation" },
    "audio-music": { zh: "音频与音乐", en: "Audio & music" },
    programming: { zh: "编程与审查", en: "Programming" },
    "bug-fixing": { zh: "Bug 复现", en: "Bug fixing" },
    "agent-skill": { zh: "Agent 与 Skill", en: "Agent & Skill" },
    "mcp-tools": { zh: "MCP 与工具", en: "MCP & tools" },
    automation: { zh: "自动化编排", en: "Automation" },
    "model-evaluation": { zh: "模型评测", en: "Model evaluation" },
    "knowledge-management": { zh: "知识管理", en: "Knowledge management" },
    "personal-review": { zh: "个人复盘", en: "Personal review" },
    "portfolio-output": { zh: "作品集与输出", en: "Portfolio output" },
  };

  const DIFFICULTY_LABELS = {
    starter: { zh: "入门", en: "Starter" },
    standard: { zh: "标准", en: "Standard" },
    complex: { zh: "复杂", en: "Complex" },
    evaluation: { zh: "评测", en: "Evaluation" },
    failure: { zh: "失败处理", en: "Failure handling" },
    review: { zh: "复盘", en: "Review" },
  };

  const STATUS_LABELS = {
    discovered: { zh: "已发现", en: "Discovered" },
    researching: { zh: "研究中", en: "Researching" },
    structured: { zh: "已整理", en: "Structured" },
    reproduced: { zh: "已复现", en: "Reproduced" },
    reviewed: { zh: "已整理", en: "Edited" },
    published: { zh: "已整理", en: "Edited" },
    archived: { zh: "已归档", en: "Archived" },
  };

  const TUTORIAL_LABELS = {
    "local-result": { zh: "本地实作", en: "Local exercise" },
    "source-tutorial": { zh: "原教程跟做", en: "Source tutorial" },
    "case-analysis": { zh: "案例拆解", en: "Case study" },
    "method-guide": { zh: "操作方案", en: "Task guide" },
  };

  function tutorialLabel(workflow, language) {
    if (workflow?.verification_status === "researching") return label(STATUS_LABELS, "researching", language);
    return label(TUTORIAL_LABELS, workflow?.tutorial_kind || "method-guide", language);
  }

  function localizedText(value, fallback, language) {
    if (Array.isArray(value)) return value.join(" · ");
    if (value && typeof value === "object") return String(value[language] ?? value.en ?? value.zh ?? fallback);
    return String(value ?? fallback);
  }

  function label(labels, value, language) {
    return localizedText(labels[value], value, language);
  }

  function renderOverview({ state, dom, createElement }) {
    if (!dom.workflowOverview || !dom.workflowGrid) return;
    const isHome = state.currentView === "home";
    const task = Array.isArray(state.taskEntries)
      ? state.taskEntries.find((entry) => entry.id === state.workflowTaskFilter)
      : null;
    const workflowIds = Array.isArray(task?.workflowIds) ? new Set(task.workflowIds) : null;
    const workflows = Array.isArray(state.workflows)
      ? state.workflows.filter((workflow) => (
        ["structured", "reproduced", "reviewed", "published"].includes(workflow?.verification_status)
        && (!workflowIds || workflowIds.has(workflow.id))
      ))
      : [];
    dom.workflowOverview.hidden = !isHome || !workflows.length;
    if (!isHome || !workflows.length) return;
    const expanded = state.workflowExpanded === true;
    const visible = expanded ? workflows : workflows.slice(0, 3);
    dom.workflowGrid.replaceChildren();
    for (const workflow of visible) {
      const card = createElement("article", "workflow-card");
      card.setAttribute("role", "listitem");
      card.dataset.workflowId = workflow.id;
      card.dataset.tutorialKind = workflow.tutorial_kind || "method-guide";
      const button = createElement("button", "workflow-card-open");
      button.type = "button";
      button.dataset.action = "open-workflow";
      button.dataset.id = workflow.id;
      button.append(
        createElement("strong", "workflow-card-title", workflow.title),
        createElement("span", "workflow-card-summary", workflow.summary),
      );
      const footer = createElement("span", "workflow-card-footer");
      footer.append(
        createElement("span", "", label(CATEGORY_LABELS, workflow.category, state.currentLang)),
        createElement("span", "workflow-card-kind", tutorialLabel(workflow, state.currentLang)),
        createElement("span", "workflow-card-arrow", String.fromCodePoint(0x2192)),
      );
      button.append(footer);
      card.append(button);
      dom.workflowGrid.append(card);
    }
    if (dom.workflowViewAll) {
      dom.workflowViewAll.textContent = task
        ? (state.currentLang === "zh" ? "查看全部任务" : "View all tasks")
        : expanded
          ? (state.currentLang === "zh" ? "收起" : "Collapse")
          : (state.currentLang === "zh" ? `查看全部 ${workflows.length} 条` : `View all ${workflows.length}`);
    }
  }

  global.KnowledgeCosmosWorkflowUI = {
    categoryLabel: (value, language) => label(CATEGORY_LABELS, value, language),
    difficultyLabel: (value, language) => label(DIFFICULTY_LABELS, value, language),
    statusLabel: (value, language) => label(STATUS_LABELS, value, language),
    tutorialLabel,
    isEligibleForHome: (workflow) => ["structured", "reproduced", "reviewed", "published"].includes(workflow?.verification_status),
    renderOverview,
  };
})(window);
