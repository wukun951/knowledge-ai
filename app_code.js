"use strict";

const DATA_VERSION = "20261017-3";
const PAGE_SIZE = 24;
const COMPACT_PAGE_SIZE = 12;
const ARENA_SNAPSHOT_DATE = "2026-08-30";
const STORAGE_KEYS = {
  language: "ai-workbench-lang",
  sidebar: "ai-workbench-sidebar-collapsed",
  favorites: "ai-workbench-favorites",
  recent: "ai-workbench-recent",
};

const SURFACE_ORDER = ["knowledge", "models", "agents", "prompts", "workflows", "aitools", "lab"];
const PERSONAL_VIEWS = ["my"];

const SURFACES = {
  knowledge: {
    label: { zh: "知识库", en: "Knowledge" },
    short: "KNOWLEDGE",
    mark: "KN",
  },
  models: {
    label: { zh: "模型", en: "Models" },
    short: "MODELS",
    mark: "MO",
  },
  agents: {
    label: { zh: "智能体", en: "Agents" },
    short: "AGENTS",
    mark: "AG",
  },
  prompts: {
    label: { zh: "提示词", en: "Prompts" },
    short: "PROMPTS",
    mark: "PR",
  },
  workflows: {
    label: { zh: "工作流", en: "Workflows" },
    short: "WORKFLOWS",
    mark: "WF",
  },
  aitools: {
    label: { zh: "AI 工具", en: "AI Tools" },
    short: "TOOLS",
    mark: "TO",
  },
  lab: {
    label: { zh: "实验室", en: "Lab" },
    short: "LAB",
    mark: "LB",
  },
};

const TASK_ENTRIES = [
  {
    id: "writing",
    label: { zh: "写作", en: "Writing" },
    description: { zh: "把想法整理成清晰、可发布的内容。", en: "Turn ideas into clear, publishable content." },
    targetView: "prompts",
    defaultChannel: "prompts",
    relatedViews: ["knowledge", "prompts", "aitools"],
    filters: { primary: "category:content", secondary: "all" },
    workflowIds: ["workflow:writing-to-publishable-content", "workflow:content-release-evaluation", "workflow:portfolio-case-from-real-work", "workflow:weekly-ai-work-review"],
  },
  {
    id: "design",
    label: { zh: "设计", en: "Design" },
    description: { zh: "寻找视觉、工业设计、图像和产品表达相关内容。", en: "Find visual, industrial design, image, and product expression resources." },
    targetView: "prompts",
    defaultChannel: "workflows",
    relatedViews: ["models", "prompts", "aitools", "lab"],
    filters: { primary: "category:design", secondary: "all" },
    workflowIds: ["workflow:product-design-sprint-with-ai", "workflow:prototype-usability-evaluation", "workflow:parametric-industrial-design", "workflow:reference-to-implementation-brief", "workflow:diffusion-image-generation", "workflow:ai-website-from-conversation", "workflow:website-release-evaluation"],
  },
  {
    id: "coding",
    label: { zh: "编程", en: "Coding" },
    description: { zh: "从方案、实现到 Review，缩短代码任务路径。", en: "Move from plan to implementation and review with less friction." },
    targetView: "prompts",
    defaultChannel: "prompts",
    relatedViews: ["knowledge", "agents", "prompts", "lab"],
    filters: { primary: "category:development", secondary: "all" },
    workflowIds: ["workflow:first-ai-code-change", "workflow:copilot-time-tracker", "workflow:bounded-repository-change", "workflow:bug-reproduction-and-review", "workflow:agent-skill-from-repeated-task", "workflow:mcp-tool-integration", "workflow:reliable-ai-automation", "workflow:mini-program-mvp-with-ai", "workflow:website-release-evaluation"],
  },
  {
    id: "research",
    label: { zh: "研究", en: "Research" },
    description: { zh: "从原始来源出发，建立可核验的研究结论。", en: "Build verifiable findings from primary sources." },
    targetView: "prompts",
    defaultChannel: "prompts",
    relatedViews: ["knowledge", "models", "prompts", "lab"],
    filters: { primary: "category:research", secondary: "all" },
    workflowIds: ["workflow:official-source-research", "workflow:research-conclusion-retrospective", "workflow:knowledge-base-from-documents", "workflow:beginner-ai-learning-path"],
  },
  {
    id: "image",
    label: { zh: "图像", en: "Image" },
    description: { zh: "选择图像模型、提示词和视觉制作工具。", en: "Choose image models, prompts, and visual production tools." },
    targetView: "prompts",
    defaultChannel: "workflows",
    relatedViews: ["models", "prompts", "aitools"],
    filters: { primary: "category:design", secondary: "all" },
    workflowIds: ["workflow:first-ai-image", "workflow:diffusion-image-generation", "workflow:ai-website-from-conversation"],
  },
  {
    id: "video",
    label: { zh: "视频", en: "Video" },
    description: { zh: "从镜头、生成模型到后期流程开始制作。", en: "Start with shots, video models, and a repeatable edit path." },
    targetView: "prompts",
    defaultChannel: "workflows",
    relatedViews: ["models", "prompts", "aitools"],
    filters: { primary: "category:design", secondary: "all" },
    workflowIds: ["workflow:first-ai-video", "workflow:first-ai-audio", "workflow:ai-short-video-production", "workflow:ai-music-and-audio-production"],
  },
  {
    id: "agent",
    label: { zh: "智能体 / 自动化", en: "Agent / Automation" },
    description: { zh: "了解技能、MCP、工具调用和自动化编排。", en: "Explore Skills, MCP, tool use, and automation patterns." },
    targetView: "agents",
    defaultChannel: "workflows",
    relatedViews: ["knowledge", "agents", "aitools", "lab"],
    filters: { primary: "resource:skill", secondary: "category:orchestration" },
    workflowIds: ["workflow:first-small-automation", "workflow:first-mcp-readonly-tool", "workflow:agent-skill-from-repeated-task", "workflow:mcp-tool-integration", "workflow:reliable-ai-automation"],
  },
  {
    id: "learning",
    label: { zh: "知识学习", en: "Learning" },
    description: { zh: "从术语、基础概念和学习路径建立 AI 认知。", en: "Build AI understanding from terms, concepts, and learning paths." },
    targetView: "knowledge",
    defaultChannel: "knowledge",
    relatedViews: ["knowledge", "models", "agents"],
    filters: { primary: "knowledge-type:course", secondary: "all" },
    workflowIds: ["workflow:beginner-ai-learning-path"],
  },
];

const TASK_CHANNELS = {
  writing: [
    { id: "knowledge", label: { zh: "知识", en: "Knowledge" }, description: { zh: "写作方法、内容结构与表达基础。", en: "Writing methods, structure, and expression basics." }, targetView: "knowledge", filters: { primary: "knowledge-type:practice", secondary: "all" } },
    { id: "skills", label: { zh: "写作技能", en: "Writing Skills" }, description: { zh: "可直接协作的写作与内容技能。", en: "Skills for writing and content work." }, targetView: "agents", filters: { primary: "resource:skill", secondary: "all" } },
    { id: "prompts", label: { zh: "提示词", en: "Prompts" }, description: { zh: "结构化写作、润色与内容生产模板。", en: "Structured writing, editing, and content prompts." }, targetView: "prompts", filters: { primary: "category:content", secondary: "all" } },
    { id: "models", label: { zh: "模型", en: "Models" }, description: { zh: "文本与推理模型的能力和榜单。", en: "Text and reasoning model capabilities." }, targetView: "models", filters: { primary: "type:text", secondary: "all" } },
    { id: "tools", label: { zh: "工具", en: "Tools" }, description: { zh: "适合写作、编辑和发布的工具。", en: "Tools for drafting, editing, and publishing." }, targetView: "aitools", filters: { primary: "all", secondary: "all" } },
    { id: "workflows", label: { zh: "工作流程", en: "Workflows" }, description: { zh: "从想法到可交付内容的完整路径。", en: "Repeatable paths from idea to deliverable." }, targetView: "home", kind: "workflows" },
  ],
  design: [
    { id: "knowledge", label: { zh: "知识", en: "Knowledge" }, description: { zh: "视觉、工业设计与产品表达基础。", en: "Visual, industrial design, and product expression basics." }, targetView: "knowledge", filters: { primary: "knowledge-type:practice", secondary: "all" } },
    { id: "skills", label: { zh: "设计技能", en: "Design Skills" }, description: { zh: "前端、视觉和设计判断相关技能。", en: "Skills for visual design and design judgment." }, targetView: "agents", filters: { primary: "resource:skill", secondary: "all" } },
    { id: "prompts", label: { zh: "提示词", en: "Prompts" }, description: { zh: "参考拆解、视觉生成和设计评审模板。", en: "Prompts for references, generation, and critique." }, targetView: "prompts", filters: { primary: "category:design", secondary: "all" } },
    { id: "models", label: { zh: "模型", en: "Models" }, description: { zh: "图像、视频和多模态模型。", en: "Image, video, and multimodal models." }, targetView: "models", filters: { primary: "type:image", secondary: "all" } },
    { id: "tools", label: { zh: "工具", en: "Tools" }, description: { zh: "设计、原型与视觉制作工具。", en: "Tools for design, prototyping, and visual production." }, targetView: "aitools", filters: { primary: "all", secondary: "all" } },
    { id: "workflows", label: { zh: "工作流程", en: "Workflows" }, description: { zh: "从参考到网站、小程序和上线评测的完整路径。", en: "Paths from reference to website or mini-program delivery and release evaluation." }, targetView: "home", kind: "workflows" },
  ],
  coding: [
    { id: "knowledge", label: { zh: "知识", en: "Knowledge" }, description: { zh: "前端、后端、API 与工程基础。", en: "Frontend, backend, API, and engineering basics." }, targetView: "knowledge", filters: { primary: "knowledge-type:practice", secondary: "all" } },
    { id: "skills", label: { zh: "编程技能", en: "Coding Skills" }, description: { zh: "开发、Review、调试和工程质量技能。", en: "Skills for development, review, debugging, and quality." }, targetView: "agents", filters: { primary: "resource:skill", secondary: "category:development" } },
    { id: "prompts", label: { zh: "提示词", en: "Prompts" }, description: { zh: "代码生成、排错与 Review 模板。", en: "Prompts for coding, debugging, and review." }, targetView: "prompts", filters: { primary: "category:development", secondary: "all" } },
    { id: "models", label: { zh: "模型", en: "Models" }, description: { zh: "代码模型、Agent 模型与工程能力。", en: "Coding and agent model capabilities." }, targetView: "models", filters: { primary: "type:coding", secondary: "all" } },
    { id: "tools", label: { zh: "工具", en: "Tools" }, description: { zh: "IDE、CLI、测试和开发工具。", en: "IDE, CLI, testing, and developer tools." }, targetView: "aitools", filters: { primary: "all", secondary: "all" } },
    { id: "workflows", label: { zh: "工作流程", en: "Workflows" }, description: { zh: "代码变更、小程序 MVP、网站评测与 Bug 修复路径。", en: "Paths for code changes, mini-program MVPs, website evaluation, and bug fixes." }, targetView: "home", kind: "workflows" },
  ],
  research: [
    { id: "knowledge", label: { zh: "知识", en: "Knowledge" }, description: { zh: "研究方法、资料整理与证据判断。", en: "Research methods, synthesis, and evidence judgment." }, targetView: "knowledge", filters: { primary: "knowledge-type:reference", secondary: "all" } },
    { id: "skills", label: { zh: "研究技能", en: "Research Skills" }, description: { zh: "检索、分析、审计和资料整理技能。", en: "Skills for retrieval, analysis, auditing, and synthesis." }, targetView: "agents", filters: { primary: "resource:skill", secondary: "category:research" } },
    { id: "prompts", label: { zh: "提示词", en: "Prompts" }, description: { zh: "官方来源研究、比较与证据审计模板。", en: "Prompts for source research, comparison, and evidence audits." }, targetView: "prompts", filters: { primary: "category:research", secondary: "all" } },
    { id: "models", label: { zh: "模型", en: "Models" }, description: { zh: "长上下文、推理和资料分析模型。", en: "Long-context, reasoning, and analysis models." }, targetView: "models", filters: { primary: "type:text", secondary: "all" } },
    { id: "tools", label: { zh: "工具", en: "Tools" }, description: { zh: "检索、阅读、整理和验证工具。", en: "Tools for retrieval, reading, synthesis, and verification." }, targetView: "aitools", filters: { primary: "all", secondary: "all" } },
    { id: "workflows", label: { zh: "工作流程", en: "Workflows" }, description: { zh: "从原始来源到可核验结论的完整路径。", en: "A path from primary sources to verifiable findings." }, targetView: "home", kind: "workflows" },
  ],
  image: [
    { id: "skills", label: { zh: "图像技能", en: "Image Skills" }, description: { zh: "图像生成、构图与视觉后期技能。", en: "Skills for image generation, composition, and finishing." }, targetView: "agents", filters: { primary: "resource:skill", secondary: "all" } },
    { id: "prompts", label: { zh: "提示词", en: "Prompts" }, description: { zh: "图像生成与视觉方向模板。", en: "Prompts for image generation and visual direction." }, targetView: "prompts", filters: { primary: "category:design", secondary: "all" } },
    { id: "models", label: { zh: "模型", en: "Models" }, description: { zh: "图像模型、编辑模型与多模态能力。", en: "Image, editing, and multimodal models." }, targetView: "models", filters: { primary: "type:image", secondary: "all" } },
    { id: "tools", label: { zh: "工具", en: "Tools" }, description: { zh: "生成、编辑、放大和管理图像的工具。", en: "Tools for generating, editing, upscaling, and managing images." }, targetView: "aitools", filters: { primary: "all", secondary: "all" } },
    { id: "workflows", label: { zh: "工作流程", en: "Workflows" }, description: { zh: "从视觉 brief 到成图和授权检查。", en: "From visual brief to final image and license review." }, targetView: "home", kind: "workflows" },
  ],
  video: [
    { id: "skills", label: { zh: "视频技能", en: "Video Skills" }, description: { zh: "镜头、剪辑和视频生成技能。", en: "Skills for shots, editing, and video generation." }, targetView: "agents", filters: { primary: "resource:skill", secondary: "all" } },
    { id: "prompts", label: { zh: "提示词", en: "Prompts" }, description: { zh: "分镜、镜头配方和视频生成模板。", en: "Prompts for storyboards, shot recipes, and generation." }, targetView: "prompts", filters: { primary: "category:design", secondary: "all" } },
    { id: "models", label: { zh: "模型", en: "Models" }, description: { zh: "视频生成、图生视频和剪辑模型。", en: "Video, image-to-video, and editing models." }, targetView: "models", filters: { primary: "type:video", secondary: "all" } },
    { id: "tools", label: { zh: "工具", en: "Tools" }, description: { zh: "生成、剪辑、字幕和发布工具。", en: "Tools for generation, editing, captions, and publishing." }, targetView: "aitools", filters: { primary: "all", secondary: "all" } },
    { id: "workflows", label: { zh: "工作流程", en: "Workflows" }, description: { zh: "从脚本到短视频和音频交付。", en: "From script to short-video and audio delivery." }, targetView: "home", kind: "workflows" },
  ],
  agent: [
    { id: "knowledge", label: { zh: "知识", en: "Knowledge" }, description: { zh: "Agent、Skill、MCP 与工具调用基础。", en: "Foundations of agents, skills, MCP, and tool use." }, targetView: "knowledge", filters: { primary: "knowledge-type:course", secondary: "knowledge-domain:agent" } },
    { id: "skills", label: { zh: "技能", en: "Skills" }, description: { zh: "可复用的智能体能力与协作规范。", en: "Reusable agent capabilities and collaboration patterns." }, targetView: "agents", filters: { primary: "resource:skill", secondary: "all" } },
    { id: "prompts", label: { zh: "提示词", en: "Prompts" }, description: { zh: "智能体配置、任务拆解和自动化模板。", en: "Prompts for agent setup, task breakdown, and automation." }, targetView: "prompts", filters: { primary: "category:agent", secondary: "all" } },
    { id: "models", label: { zh: "模型", en: "Models" }, description: { zh: "Agent、推理与工具调用模型。", en: "Agent, reasoning, and tool-use models." }, targetView: "models", filters: { primary: "type:text", secondary: "all" } },
    { id: "tools", label: { zh: "工具", en: "Tools" }, description: { zh: "MCP、CLI 和自动化编排工具。", en: "MCP, CLI, and orchestration tools." }, targetView: "aitools", filters: { primary: "all", secondary: "all" } },
    { id: "workflows", label: { zh: "工作流程", en: "Workflows" }, description: { zh: "从任务卡到独立 Review 的协作路径。", en: "Paths from task cards to independent review." }, targetView: "home", kind: "workflows" },
  ],
  learning: [
    { id: "knowledge", label: { zh: "知识", en: "Knowledge" }, description: { zh: "从术语、基础课到实战手册。", en: "From terms and concept courses to practice guides." }, targetView: "knowledge", filters: { primary: "knowledge-type:course", secondary: "all" } },
    { id: "skills", label: { zh: "学习技能", en: "Learning Skills" }, description: { zh: "教学、辅导和知识整理技能。", en: "Skills for teaching, coaching, and synthesis." }, targetView: "agents", filters: { primary: "resource:skill", secondary: "all" } },
    { id: "prompts", label: { zh: "提示词", en: "Prompts" }, description: { zh: "概念解释、学习计划和复习模板。", en: "Prompts for explanations, study plans, and review." }, targetView: "prompts", filters: { primary: "category:content", secondary: "all" } },
    { id: "models", label: { zh: "模型", en: "Models" }, description: { zh: "理解不同模型适合什么学习任务。", en: "Understand which models fit learning tasks." }, targetView: "models", filters: { primary: "type:text", secondary: "all" } },
    { id: "tools", label: { zh: "工具", en: "Tools" }, description: { zh: "阅读、笔记、检索和练习工具。", en: "Tools for reading, notes, retrieval, and practice." }, targetView: "aitools", filters: { primary: "all", secondary: "all" } },
    { id: "workflows", label: { zh: "工作流程", en: "Workflows" }, description: { zh: "从概念地图到真实任务练习。", en: "From concept map to real practice tasks." }, targetView: "home", kind: "workflows" },
  ],
};

function taskChannelsForId(taskId) {
  return TASK_CHANNELS[taskId] || [];
}

function taskChannelForId(taskId, channelId) {
  return taskChannelsForId(taskId).find((channel) => channel.id === channelId) || null;
}

const VIEWS = {
  home: {
    eyebrow: { zh: "", en: "AI WORKBENCH" },
    title: { zh: "首页", en: "Home" },
    subtitle: {
      zh: "",
      en: "",
    },
  },
  knowledge: {
    eyebrow: { zh: "KNOWLEDGE BASE", en: "KNOWLEDGE BASE" },
    title: { zh: "知识库", en: "Knowledge" },
    subtitle: { zh: "从白话术语到权威资料，逐步建立 AI 认知与实践能力。", en: "Build AI understanding and practical skill through plain-language terms and trusted sources." },
  },
  models: {
    eyebrow: { zh: "", en: "MODEL ATLAS" },
    title: { zh: "模型", en: "Models" },
    subtitle: { zh: "按公司、系列、型号和实际使用场景浏览模型。", en: "Browse models by company, family, version, and real-world use." },
  },
  agents: {
    eyebrow: { zh: "", en: "AGENT PRACTICE" },
    title: { zh: "智能体", en: "Agents" },
    subtitle: { zh: "技能、MCP、工具调用与工程实践。", en: "Skills, MCP, tool use, and engineering practice." },
  },
  prompts: {
    eyebrow: { zh: "PROMPT LIBRARY", en: "PROMPT LIBRARY" },
    title: { zh: "提示词", en: "Prompts" },
    subtitle: { zh: "经过整理的任务模板、变量和使用边界。", en: "Organized task templates, variables, and usage boundaries." },
  },
  workflows: {
    eyebrow: { zh: "PRACTICAL WORKFLOWS", en: "PRACTICAL WORKFLOWS" },
    title: { zh: "工作流", en: "Workflows" },
    subtitle: { zh: "", en: "" },
  },
  aitools: {
    eyebrow: { zh: "AI TOOLS", en: "AI TOOLS" },
    title: { zh: "AI 工具", en: "AI Tools" },
    subtitle: { zh: "按用途、限制和真实使用场景浏览工具。", en: "Browse tools by purpose, limits, and real usage." },
  },
  lab: {
    eyebrow: { zh: "EXPERIMENT LAB", en: "EXPERIMENT LAB" },
    title: { zh: "实验室", en: "Lab" },
    subtitle: { zh: "自己琢磨的实验、半成品和小工具。跑通的留下记录，跑不通的也写下踩过的坑。", en: "My own experiments, prototypes and small tools — what worked and what didn’t." },
  },
  my: {
    eyebrow: { zh: "", en: "" },
    title: { zh: "我的", en: "My workspace" },
    subtitle: { zh: "", en: "" },
  },
  team: {
    eyebrow: { zh: "", en: "" },
    title: { zh: "团队", en: "Team" },
    subtitle: { zh: "", en: "" },
  },
};

const SEARCH_PLACEHOLDERS = {
  home: {
      zh: "搜索全站知识、模型、智能体、提示词或工具",
    en: "Search all knowledge, models, agents, prompts, and tools",
  },
  knowledge: { zh: "搜索知识库概念与方法", en: "Search knowledge concepts and methods" },
  models: { zh: "搜索模型、公司、系列或型号", en: "Search models, companies, families, or IDs" },
  agents: { zh: "搜索智能体、技能、MCP 或工程实践", en: "Search agents, skills, MCP, or engineering practices" },
  prompts: { zh: "搜索提示词用途、任务或变量", en: "Search prompt use cases, tasks, or variables" },
  aitools: { zh: "搜索 AI 工具与使用场景", en: "Search AI tools and use cases" },
  lab: { zh: "搜索实验记录与验证方法", en: "Search experiments and methods" },
  workflows: { zh: "搜索工作流、步骤、工具或适用任务", en: "Search workflows, steps, tools, or use cases" },
  my: { zh: "搜索我的收藏和最近浏览", en: "Search favorites and recent items" },
  team: { zh: "搜索团队内容", en: "Search team content" },
};

const SEARCH_ALIASES = {
  "ai建站": ["搭建网站", "网站", "vibe coding"],
  "ai 建站": ["搭建网站", "网站", "vibe coding"],
  "建站": ["搭建网站", "网站"],
  "做网站": ["搭建网站", "网站"],
  "小程序": ["产品设计", "网站", "vibe coding"],
  "提示词": ["prompt", "任务模板"],
  "工作流": ["workflow", "流程"],
  "量化": ["quantization", "量化"],
  "推理": ["inference", "推理"],
  "微调": ["fine-tuning", "lora", "微调"],
  "提示注入": ["prompt injection", "注入", "工具越权", "agent 安全"],
  "安全": ["security", "权限", "越权", "注入"],
  "权限": ["permission", "越权", "最小权限", "安全"],
  "本地模型": ["local model", "ollama", "离线", "本地部署"],
  "离线": ["本地模型", "ollama", "隐私"],
  "语音": ["speech", "transcription", "whisper", "音频"],
  "音乐": ["music", "audiocraft", "音频"],
  "文档转换": ["markdown", "markitdown", "文档"],
  "知识库": ["rag", "检索", "llamaindex", "ragflow"],
  "第一次改代码": ["第一次让 ai 改一个小项目", "编程入门", "回滚", "vibe coding"],
  "编程入门": ["第一次让 ai 改一个小项目", "回滚", "修改代码"],
};

function expandSearchQuery(query) {
  const normalized = normalizeText(query);
  const aliases = SEARCH_ALIASES[normalized] || SEARCH_ALIASES[String(query || "").trim().toLowerCase()] || [];
  return [normalized, ...aliases.map(normalizeText)].filter(Boolean);
}

const FILTER_AXIS_LABELS = {
  knowledge: {
    primary: { zh: "内容类型", en: "Content type" },
    secondary: { zh: "知识领域", en: "Knowledge domain" },
  },
  models: {
    primary: { zh: "模型类型", en: "Model type" },
    secondary: { zh: "厂商", en: "Company" },
  },
  agents: {
    primary: { zh: "资源形态", en: "Resource type" },
    secondary: { zh: "能力领域", en: "Capability" },
  },
  prompts: {
    primary: { zh: "任务结果", en: "Task outcome" },
    secondary: { zh: "", en: "" },
  },
};

const I18N = {
  zh: {
    navHome: "首页",
    navKnowledge: "知识库",
    navModels: "模型",
    navAgents: "智能体",
    navPrompts: "提示词",
    navWorkflows: "工作流",
    navTools: "AI 工具",
    navLab: "实验室",
    navMy: "我的",
    navTeam: "团队",
    sidebarHint: "从任务出发，找到可执行的下一步。",
    itemCountLabel: "内容条目",
    updatedLabel: "最近更新",
    overviewTitle: "内容入口",
    libraryTitle: "内容索引",
    modelLibraryTitle: "模型目录",
    agentLibraryTitle: "技能与 MCP",
    moduleFilterLabel: "按模块分类",
    companyFilterLabel: "按公司 / 平台分类",
    agentFilterLabel: "按智能体能力分类",
    promptFilterLabel: "按提示词用途分类",
    scrollTabsLeft: "向左浏览分类",
    scrollTabsRight: "向右浏览分类",
    searchLabel: "搜索内容",
    curatedTitle: "近期精选",
    libraryEyebrow: "",
    curatedEyebrow: "",
    workflowLibraryTitle: "工作流程",
    workflowLibraryEyebrow: "",
    labLibraryTitle: "实验记录",
    labLibraryEyebrow: "",
    searchPlaceholder: "搜索任务、模型、智能体、提示词或工具",
    modeAll: "全部",
    modeKnowledge: "知识库",
    modeModels: "模型",
    modeAgents: "智能体",
    modePrompts: "提示词",
    modeTools: "AI 工具",
    modeLab: "实验室",
    savedFilter: "只看收藏",
    clearSavedFilter: "取消收藏筛选",
    resetFilters: "重置筛选",
    emptyTitle: "没有匹配内容",
    emptyHint: "换一个关键词，或清除当前筛选。",
    emptySavedTitle: "还没有收藏内容",
    emptySavedHint: "点击内容卡片右上角的星标，稍后可以从这里回来。",
    viewAll: "查看全部",
    loadMore: "加载更多",
    itemsShown: (shown, total) => `显示 ${shown} / ${total} 条内容`,
    remaining: (count) => `还有 ${count} 条`,
    domainLabel: "领域",
    sourcesLabel: "来源",
    tagsLabel: "标签",
    nextLabel: "下一步",
    contentLabel: "详细内容",
    copyContent: "复制内容",
    copyPrompt: "复制提示词",
    copyingPrompt: "正在复制提示词",
    copiedPrompt: "已复制提示词",
    copyPromptFailed: "复制失败",
    viewDetails: "查看详情",
    resourceSkill: "技能",
    resourceMcp: "MCP",
    promptRecipe: "任务模板",
    promptBestFor: "适合",
    promptOutcome: "可得到",
    copyUse: "复制使用",
    sourcePrefix: "来源",
    clearSearch: "清空搜索",
    copied: "已复制",
    copyFailed: "复制失败",
    contentLoading: "正在加载详细内容...",
    contentLoadError: "详细内容暂时无法加载。",
    openSource: "打开来源",
    noSource: "暂无来源",
    noTags: "暂无标签",
    noNext: "暂无下一步",
    noContent: "暂无详细内容",
    favorite: "收藏内容",
    unfavorite: "取消收藏",
    close: "关闭",
    collapseSidebar: "收起侧边栏",
    expandSidebar: "展开侧边栏",
    switchToEnglish: "Switch to English",
    indexLoading: "正在整理知识索引",
    loadError: "知识索引加载失败，请重试。",
    retry: "重新加载",
    workspaceReadError: "本地收藏或浏览记录无法读取。",
    workspaceSaveError: "更改未能保存到浏览器。",
    workspacePartialSaveError: "本地保存失败，浏览器里的记录可能不完整。",
    workspaceImportError: "未导入，文件格式不正确。",
    workspaceImportVersionError: "未导入，不支持此备份版本。",
    workspaceImportSizeError: "未导入，文件超过 1 MB。",
    workspaceImportSuccess: "收藏和最近浏览已合并导入。",
    workspaceClearRecentConfirm: "清空此浏览器的最近浏览记录？收藏会保留。",
    workspaceClearAllConfirm: "清空此浏览器的收藏和最近浏览？",
    workspaceReplaceUnreadableConfirm: "本地旧数据无法读取。用这份文件恢复收藏和最近浏览？",
    workspaceExport: "导出本地数据",
    workspaceImport: "导入本地数据",
  },
  en: {
    navHome: "Home",
    navKnowledge: "Knowledge",
    navModels: "Models",
    navAgents: "Agents",
    navPrompts: "Prompts",
    navWorkflows: "Workflows",
    navTools: "AI Tools",
    navLab: "Lab",
    navMy: "My",
    navTeam: "Team",
    sidebarHint: "Start with a task and find the next actionable step.",
    itemCountLabel: "Items",
    updatedLabel: "Updated",
    overviewTitle: "Content",
    libraryTitle: "Library index",
    modelLibraryTitle: "Model directory",
    agentLibraryTitle: "Skills and MCP",
    moduleFilterLabel: "Filter by module",
    companyFilterLabel: "Filter by company / platform",
    agentFilterLabel: "Filter by agent capability",
    promptFilterLabel: "Filter by prompt use",
    scrollTabsLeft: "Scroll categories left",
    scrollTabsRight: "Scroll categories right",
    searchLabel: "Search content",
    curatedTitle: "Recent picks",
    libraryEyebrow: "",
    curatedEyebrow: "",
    workflowLibraryTitle: "Workflows",
    workflowLibraryEyebrow: "",
    labLibraryTitle: "Experiment records",
    labLibraryEyebrow: "",
    searchPlaceholder: "Search tasks, models, agents, prompts, or tools",
    modeAll: "All",
    modeKnowledge: "Knowledge",
    modeModels: "Models",
    modeAgents: "Agents",
    modePrompts: "Prompts",
    modeTools: "AI Tools",
    modeLab: "Lab",
    savedFilter: "Show saved only",
    clearSavedFilter: "Clear saved filter",
    resetFilters: "Reset filters",
    emptyTitle: "No matching content",
    emptyHint: "Try another keyword or clear the current filter.",
    emptySavedTitle: "No saved content yet",
    emptySavedHint: "Use the star on a content card to save it here.",
    viewAll: "View all",
    loadMore: "Load more",
    itemsShown: (shown, total) => `Showing ${shown} / ${total} items`,
    remaining: (count) => `${count} remaining`,
    domainLabel: "Domain",
    sourcesLabel: "Sources",
    tagsLabel: "Tags",
    nextLabel: "Next",
    contentLabel: "Content",
    copyContent: "Copy content",
    copyPrompt: "Copy prompt",
    copyingPrompt: "Copying prompt",
    copiedPrompt: "Prompt copied",
    copyPromptFailed: "Copy failed",
    viewDetails: "View details",
    resourceSkill: "Skill",
    resourceMcp: "MCP",
    promptRecipe: "Task template",
    promptBestFor: "Best for",
    promptOutcome: "You get",
    copyUse: "Copy to use",
    sourcePrefix: "Source",
    clearSearch: "Clear search",
    copied: "Copied",
    copyFailed: "Copy failed",
    contentLoading: "Loading detailed content...",
    contentLoadError: "Detailed content is temporarily unavailable.",
    openSource: "Open source",
    noSource: "No source listed",
    noTags: "No tags listed",
    noNext: "No next step listed",
    noContent: "No detailed content yet",
    favorite: "Save content",
    unfavorite: "Remove from saved",
    close: "Close",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    switchToChinese: "切换中文",
    indexLoading: "Preparing the knowledge index",
    loadError: "The knowledge index could not be loaded.",
    retry: "Retry",
    workspaceReadError: "Saved items or history could not be read.",
    workspaceSaveError: "Changes could not be saved to this browser.",
    workspacePartialSaveError: "Local saving failed. Records in this browser may be incomplete.",
    workspaceImportError: "Nothing imported. The file format is invalid.",
    workspaceImportVersionError: "Nothing imported. This backup version is unsupported.",
    workspaceImportSizeError: "Nothing imported. The file exceeds 1 MB.",
    workspaceImportSuccess: "Saved items and recent history were merged.",
    workspaceClearRecentConfirm: "Clear recent history in this browser? Saved items will remain.",
    workspaceClearAllConfirm: "Clear saved items and recent history in this browser?",
    workspaceReplaceUnreadableConfirm: "Existing local data cannot be read. Restore saved items and history from this file?",
    workspaceExport: "Export local data",
    workspaceImport: "Import local data",
  },
};

const MODEL_LOGOS = {
  "anthropic-claude": { name: "Claude", src: "images/anthropic-claude.png" },
  "openai-gpt": { name: "ChatGPT", src: "images/openai-gpt.png" },
  "google-gemini": { name: "Gemini", src: "images/google-gemini.png" },
  "deepseek-chat": { name: "DeepSeek", src: "images/deepseek-chat.png" },
  "xai-grok": { name: "xAI", src: "images/xai-grok-official.ico" },
  "openrouter-or": { name: "OpenRouter", src: "images/openrouter-or.png" },
  midjourney: { name: "Midjourney", src: "images/midjourney.png" },
  "stable-diffusion": { name: "Stable Diffusion", src: "images/stable-diffusion.png" },
  "runway-gen3": { name: "Runway", src: "images/runway-gen3.png" },
  "pika-video": { name: "Pika", src: "images/pika-video.png" },
  "kling-ai": { name: "Kling", src: "images/kling-ai.png" },
};

const MODEL_COMPANIES = [
  { id: "anthropic", label: { zh: "Anthropic", en: "Anthropic" }, logo: "images/anthropic-claude.svg", accent: "#6b5b95" },
  { id: "openai", label: { zh: "OpenAI", en: "OpenAI" }, logo: "images/openai-gpt.png", accent: "#286b56" },
  { id: "google", label: { zh: "Google DeepMind", en: "Google DeepMind" }, logo: "images/google-gemini.png", accent: "#4278bd" },
  { id: "deepseek", label: { zh: "DeepSeek", en: "DeepSeek" }, logo: "images/deepseek-chat.png", accent: "#3979a8" },
  { id: "xai", label: { zh: "xAI", en: "xAI" }, logo: "images/xai-grok-official.ico", accent: "#303432" },
  { id: "openrouter", label: { zh: "OpenRouter", en: "OpenRouter" }, logo: "images/openrouter-or.png", accent: "#756451" },
  { id: "midjourney", label: { zh: "Midjourney", en: "Midjourney" }, logo: "images/midjourney.png", accent: "#4d5660" },
  { id: "stability", label: { zh: "Stability AI", en: "Stability AI" }, logo: "images/stable-diffusion.png", accent: "#6e7b3e" },
  { id: "runway", label: { zh: "Runway", en: "Runway" }, logo: "images/runway-gen3.png", accent: "#795f9b" },
  { id: "pika", label: { zh: "Pika", en: "Pika" }, logo: "images/pika-video.png", accent: "#b85b78" },
  { id: "kuaishou", label: { zh: "快手 Kuaishou", en: "Kuaishou" }, logo: "images/kuaishou-official.ico", accent: "#168674" },
  { id: "blackforest", label: { zh: "Black Forest Labs", en: "Black Forest Labs" }, logo: "images/blackforest-favicon.png", accent: "#486a58" },
  { id: "bytedance", label: { zh: "字节跳动 / 即梦", en: "ByteDance / Jimeng" }, logo: "images/bytedance-dreamina.png", accent: "#1e6bff" },
  { id: "lumalabs", label: { zh: "Luma AI", en: "Luma AI" }, logo: "images/luma-logo.svg", accent: "#756b5e" },
  { id: "minimax", label: { zh: "MiniMax / 海螺", en: "MiniMax / Hailuo" }, logo: "images/minimax.ico", accent: "#2f72ce" },
  { id: "adobe", label: { zh: "Adobe", en: "Adobe" }, logo: "images/adobe.ico", accent: "#d42f2f" },
];

const ANALYSIS_CREATOR_LOGOS = {
  anthropic: "images/anthropic-claude.png",
  openai: "images/openai-gpt.png",
  google: "images/google-gemini.png",
  deepseek: "images/deepseek-chat.png",
  spacexai: "images/xai-grok-official.ico",
  minimax: "images/minimax.ico",
  kimi: "images/kimi.ico",
  "z ai": "images/z-ai.svg",
  baidu: "images/baidu-official.ico",
  alibaba: "images/qwen.png",
  meta: "images/meta.ico",
  microsoft: "images/microsoft.ico",
  amazon: "images/amazon.ico",
  nvidia: "images/nvidia.ico",
  mistral: "images/mistral.ico",
  cohere: "images/cohere.ico",
  tencent: "images/tencent.png",
  xiaomi: "images/xiaomi.ico",
  "microsoft ai": "images/microsoft.ico",
  bytedance: "images/bytedance-dreamina.png",
  "bytedance seed": "images/seedance.ico",
  "black forest labs": "images/blackforest-favicon.png",
  flux: "images/blackforest-favicon.png",
  "luma labs": "images/luma-logo.svg",
  klingai: "images/kling-ai.png",
  kling: "images/kling-ai.png",
  "skywork ai": "images/skywork-logo.png",
  vidu: "images/vidu-logo.png",
  pixverse: "images/pixverse-logo.svg",
  lightricks: "images/ltx-logo.svg",
  reve: "images/reve.ico",
  hidream: "images/hidream.ico",
  ideogram: "images/ideogram.ico",
  krea: "images/krea-logo.png",
  recraft: "images/recraft-logo.png",
  suno: "images/suno.ico",
  mureka: "images/mureka.ico",
  elevenlabs: "images/elevenlabs.ico",
  "producer.ai": "images/producer.ico",
  udio: "images/udio.png",
  sonauto: "images/sonauto.ico",
  stability: "images/stable-diffusion.png",
  "stability.ai": "images/stable-diffusion.png",
  meta: "images/meta-official.ico",
};

const MODEL_TYPE_GROUPS = [
  { id: "text", label: { zh: "文本与推理", en: "Text & reasoning" }, types: ["LLM", "Reasoning", "Agentic"] },
  { id: "image", label: { zh: "图像生成", en: "Image" }, types: ["Image"] },
  { id: "video", label: { zh: "视频生成", en: "Video" }, types: ["Video"] },
  { id: "multimodal", label: { zh: "多模态", en: "Multimodal" }, types: ["Multimodal"] },
  { id: "coding", label: { zh: "编程", en: "Coding" }, types: ["Coding"] },
  { id: "router", label: { zh: "模型路由", en: "Router" }, types: ["Router"] },
];

const AA_LEADERBOARD_METRICS = [
  { id: "intelligence", key: "intelligence_index", label: { zh: "智能指数", en: "Intelligence" }, note: { zh: "Artificial Analysis Intelligence Index", en: "Artificial Analysis Intelligence Index" }, direction: "desc", unit: "" },
  { id: "speed", key: "median_tokens_per_second", label: { zh: "输出速度", en: "Output speed" }, note: { zh: "Median Tokens/s", en: "Median Tokens/s" }, direction: "desc", unit: " tok/s" },
  { id: "latency", key: "latency_first_chunk_s", label: { zh: "首字延迟", en: "First-chunk latency" }, note: { zh: "Latency First Chunk", en: "Latency First Chunk" }, direction: "asc", unit: "s" },
  { id: "cost", key: "cost_per_task_usd", label: { zh: "单任务成本", en: "Cost per task" }, note: { zh: "Cost per Task USD", en: "Cost per Task USD" }, direction: "asc", unit: "$" },
  { id: "response", key: "total_response_s", label: { zh: "总响应时间", en: "Total response" }, note: { zh: "Total Response", en: "Total Response" }, direction: "asc", unit: "s" },
  { id: "context", key: "context_window", label: { zh: "上下文窗口", en: "Context window" }, note: { zh: "Context Window", en: "Context Window" }, direction: "desc", unit: "" },
];

const MODEL_LEADERBOARD_CATEGORIES = [
  {
    id: "text",
    label: { zh: "Text", en: "Text" },
    source: "Arena",
    kind: "arena",
    defaultLeaderboard: "chat",
    subcategories: [
      { id: "text", leaderboardId: "chat", label: { zh: "Text", en: "Text" } },
      { id: "search", leaderboardId: "search", label: { zh: "Search", en: "Search" } },
      { id: "vision", leaderboardId: "vision", label: { zh: "Vision", en: "Vision" } },
      { id: "document", leaderboardId: "document", label: { zh: "Document", en: "Document" } },
    ],
  },
  { id: "agent", label: { zh: "Agent", en: "Agent" }, source: "Arena", kind: "arena" },
  {
    id: "code",
    label: { zh: "Code", en: "Code" },
    source: "Arena",
    kind: "arena",
    defaultLeaderboard: "code",
    subcategories: [
      { id: "webdev", leaderboardId: "code", label: { zh: "WebDev", en: "WebDev" } },
      { id: "image-to-webdev", leaderboardId: "image-to-webdev", label: { zh: "Image-to-WebDev", en: "Image-to-WebDev" } },
    ],
  },
  {
    id: "image",
    label: { zh: "Image", en: "Image" },
    source: "Arena",
    kind: "arena",
    defaultLeaderboard: "image",
    subcategories: [
      { id: "text-to-image", leaderboardId: "image", label: { zh: "Text-to-Image", en: "Text-to-Image" } },
      { id: "image-edit", leaderboardId: "image-edit", label: { zh: "Image Edit", en: "Image Edit" } },
    ],
  },
  {
    id: "video",
    label: { zh: "Video", en: "Video" },
    source: "Arena",
    kind: "arena",
    defaultLeaderboard: "video",
    subcategories: [
      { id: "text-to-video", leaderboardId: "video", label: { zh: "Text-to-Video", en: "Text-to-Video" } },
      { id: "image-to-video", leaderboardId: "image-to-video", label: { zh: "Image-to-Video", en: "Image-to-Video" } },
      { id: "video-edit", leaderboardId: "video-edit", label: { zh: "Video Edit", en: "Video Edit" } },
    ],
  },
  { id: "music", label: { zh: "Music", en: "Music" }, source: "Artificial Analysis", kind: "media" },
  { id: "general", label: { zh: "综合指标", en: "General metrics" }, source: "Artificial Analysis", kind: "general" },
];

const HOME_LEADERBOARD_CATEGORY_IDS = ["text", "agent", "code", "image", "video", "music"];

// Arena 公开榜单快照保留各任务分支的排名、分数与置信区间；音乐仍使用 Artificial Analysis 的独立快照。
const ARENA_LEADERBOARD_SNAPSHOTS = {
  agent: {
    title: { zh: "智能体任务净提升榜", en: "Agent net improvement" },
    sourceUrl: "https://arena.ai/leaderboard/agent",
    valueLabel: { zh: "净提升", en: "Net improvement" },
    valueUnit: "%",
    rows: [
      ["Anthropic", "Claude Opus 5 (High)", 12.99, "±1.71%"],
      ["Anthropic", "Claude Opus 5 (Max)", 12.73, "±1.96%"],
      ["Anthropic", "Claude Fable 5 (High)", 11.70, "±1.62%"],
      ["OpenAI", "GPT 5.6 Sol (xHigh)", 10.24, "±1.48%"],
      ["Anthropic", "Claude Opus 4.8 (High)", 9.90, "±1.56%"],
      ["Kimi", "Kimi K3 (Max)", 9.22, "±0.61%"],
      ["OpenAI", "GPT 5.5 (xHigh)", 7.92, "±0.99%"],
      ["Anthropic", "Claude Sonnet 5 (High)", 7.65, "±2.25%"],
      ["Anthropic", "Claude Opus 4.7 (High)", 7.03, "±1.30%"],
      ["Anthropic", "Claude Opus 4.7", 6.86, "±1.32%"],
    ],
  },
  chat: {
    title: { zh: "Text 对话偏好榜", en: "Text chat preference" },
    sourceUrl: "https://arena.ai/leaderboard/text",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["Anthropic", "claude-fable-5", 1507, "±5"],
      ["Anthropic", "claude-opus-4-6-high", 1505, "±4"],
      ["Anthropic", "claude-opus-4-7-high", 1502, "±4"],
      ["Meta", "muse-spark-1.2 (xHigh)", 1498, "±10"],
      ["Anthropic", "claude-opus-4-6", 1497, "±3"],
      ["Anthropic", "claude-opus-4-7", 1494, "±4"],
      ["Anthropic", "claude-opus-5-high", 1492, "±5"],
      ["Meta", "muse-spark-1.1", 1490, "±5"],
      ["Google", "gemini-3.7-flash-high", 1490, "±8"],
      ["Kimi", "kimi-k3-max", 1489, "±6"],
    ],
  },
  code: {
    title: { zh: "WebDev 编程偏好榜", en: "WebDev coding preference" },
    sourceUrl: "https://arena.ai/leaderboard/code/webdev",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["Anthropic", "claude-opus-5-max", 1691, "+9/-9"],
      ["Kimi", "kimi-k3-max", 1674, "+11/-11"],
      ["Alibaba", "qwen3.8-max", 1669, "+13/-13"],
      ["Anthropic", "claude-opus-5-high", 1663, "+8/-8"],
      ["SpaceXAI", "grok-4.6-high", 1629, "+17/-17"],
      ["Anthropic", "claude-fable-5", 1626, "+8/-8"],
      ["OpenAI", "gpt-5.6-sol-xhigh (codex-harness)", 1619, "+8/-8"],
      ["Z AI", "glm-5.3-max", 1599, "+15/-15"],
      ["Alibaba", "qwen3.8-27b", 1595, "+13/-13"],
      ["Google", "gemini-3.7-flash-high", 1587, "+13/-13"],
    ],
  },
  image: {
    title: { zh: "文生图偏好榜", en: "Text-to-image preference" },
    sourceUrl: "https://arena.ai/leaderboard/text-to-image",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["OpenAI", "gpt-image-2 (medium)", 1382, "±4"],
      ["Microsoft AI", "mai-image-2.6-preview", 1331, "±8"],
      ["SpaceXAI", "grok-imagine-image-2.0 (low)", 1316, "±12"],
      ["Reve", "reve-2.1", 1302, "±8"],
      ["Meta", "muse-image", 1281, "±6"],
      ["Reve", "reve-2.0", 1270, "±6"],
      ["Google", "gemini-3.1-flash-image (nano-banana-2) [web-search]", 1263, "±5"],
      ["ByteDance Seed", "seedream-5.0-pro", 1258, "±5"],
      ["Alibaba", "qwen-image-3.0-pro", 1255, "±7"],
      ["Microsoft AI", "mai-image-2.5", 1254, "±4"],
    ],
  },
  video: {
    title: { zh: "文生视频偏好榜", en: "Text-to-video preference" },
    sourceUrl: "https://arena.ai/leaderboard/text-to-video",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["Google", "gemini-omni-1.1-flash", 1515, "±16"],
      ["Google", "gemini-omni-flash", 1512, "±10"],
      ["Flux", "flux-3-video", 1495, "±17"],
      ["ByteDance Seed", "dreamina-seedance-2.0-720p", 1479, "±9"],
      ["ByteDance Seed", "dreamina-seedance-2.5-720p", 1476, "±14"],
      ["MiniMax", "minimax-h3", 1460, "±10"],
      ["Meta", "muse-video", 1457, "±15"],
      ["Alibaba-ATH", "happyhorse-1.0", 1428, "±13"],
      ["OpenAI", "sora-2-pro", 1365, "±7"],
      ["Google", "veo-3.1-audio", 1364, "±14"],
    ],
  },
  search: {
    title: { zh: "Search 联网检索榜", en: "Search-grounded ranking" },
    sourceUrl: "https://arena.ai/leaderboard/search",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["OpenAI", "gpt-5.6-sol-xhigh", 1257, "±7"],
      ["Anthropic", "claude-opus-4-6-search", 1253, "±5"],
      ["OpenAI", "gpt-5.5-search", 1242, "±5"],
      ["Anthropic", "claude-opus-4-7", 1233, "±5"],
      ["Anthropic", "claude-fable-5", 1230, "±8"],
      ["Baidu", "ernie-5.1", 1227, "±10"],
      ["Anthropic", "claude-sonnet-4-6-search", 1221, "±5"],
      ["SpaceXAI", "grok-4.5", 1213, "±7"],
      ["Google", "gemini-3.1-pro-grounding", 1210, "±5"],
      ["Google", "gemini-3-pro-grounding", 1207, "±6"],
    ],
  },
  vision: {
    title: { zh: "Vision 多模态视觉榜", en: "Vision multimodal ranking" },
    sourceUrl: "https://arena.ai/leaderboard/vision",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["Anthropic", "claude-fable-5", 1313, "±8"],
      ["Anthropic", "claude-opus-4-7-high", 1301, "±7"],
      ["Alibaba", "qwen3.8-max", 1300, "±8"],
      ["Anthropic", "claude-opus-4-7", 1299, "±7"],
      ["Anthropic", "claude-opus-4-6-high", 1299, "±7"],
      ["Meta", "muse-spark", 1294, "±9"],
      ["Anthropic", "claude-opus-4-6", 1293, "±7"],
      ["Meta", "muse-spark-1.2 (xHigh)", 1292, "±15"],
      ["Anthropic", "claude-opus-5-high", 1290, "±8"],
      ["Google", "gemini-3-pro", 1289, "±8"],
    ],
  },
  document: {
    title: { zh: "Document 文档理解榜", en: "Document understanding ranking" },
    sourceUrl: "https://arena.ai/leaderboard/document",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["Anthropic", "claude-opus-5-high", 1520, "±15"],
      ["Anthropic", "claude-opus-4-6", 1510, "±6"],
      ["Anthropic", "claude-opus-4-6-high", 1506, "±7"],
      ["Anthropic", "claude-fable-5", 1504, "±9"],
      ["Anthropic", "claude-opus-4-7", 1498, "±7"],
      ["Anthropic", "claude-opus-4-7-high", 1497, "±7"],
      ["OpenAI", "gpt-5.5-high", 1485, "±7"],
      ["Anthropic", "claude-sonnet-4-6", 1483, "±6"],
      ["OpenAI", "gpt-5.5", 1480, "±7"],
    ],
  },
  "image-to-webdev": {
    title: { zh: "Image-to-WebDev 还原榜", en: "Image-to-WebDev ranking" },
    sourceUrl: "https://arena.ai/leaderboard/code/image-to-webdev",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["Anthropic", "claude-opus-5-max", 1664, "+16/-16"],
      ["Anthropic", "claude-fable-5", 1623, "+12/-12"],
      ["Alibaba", "qwen3.8-max", 1618, "+15/-15"],
      ["OpenAI", "gpt-5.6-sol-xhigh (codex-harness)", 1606, "+15/-15"],
      ["Anthropic", "claude-opus-4-7-high", 1576, "+10/-10"],
      ["SpaceXAI", "grok-4.5", 1574, "+15/-15"],
      ["Alibaba", "qwen3.8-27b", 1574, "+15/-15"],
      ["Kimi", "kimi-k3-max", 1573, "+17/-17"],
      ["Anthropic", "claude-opus-4-7", 1564, "+9/-9"],
      ["Google", "gemini-3.6-flash-high", 1544, "+16/-16"],
    ],
  },
  "image-edit": {
    title: { zh: "Image Edit 图像编辑榜", en: "Image editing preference" },
    sourceUrl: "https://arena.ai/leaderboard/image-edit",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["OpenAI", "gpt-image-2 (medium)", 1462, "±4"],
      ["SpaceXAI", "grok-imagine-image-2.0 (low)", 1439, "±8"],
      ["Microsoft AI", "mai-image-2.6-preview", 1417, "±7"],
      ["Meta", "muse-image", 1405, "±5"],
      ["Microsoft AI", "mai-image-2.5", 1399, "±4"],
      ["ByteDance Seed", "seedream-5.0-pro", 1395, "±4"],
      ["Google", "gemini-3-pro-image-2k (nano-banana-pro)", 1390, "±3"],
      ["SpaceXAI", "grok-imagine-image-quality (20260519)", 1390, "±6"],
      ["OpenAI", "chatgpt-image-latest-high-fidelity (20251216)", 1390, "±3"],
      ["Google", "gemini-3.1-flash-image (nano-banana-2) [web-search]", 1387, "±5"],
    ],
  },
  "image-to-video": {
    title: { zh: "Image-to-Video 图生视频榜", en: "Image-to-video preference" },
    sourceUrl: "https://arena.ai/leaderboard/image-to-video",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["MiniMax", "minimax-h3", 1494, "±6"],
      ["Google", "gemini-omni-1.1-flash", 1488, "±11"],
      ["ByteDance Seed", "dreamina-seedance-2.5-720p", 1483, "±12"],
      ["ByteDance Seed", "dreamina-seedance-2.0-720p", 1477, "±8"],
      ["Google", "gemini-omni-flash", 1463, "±6"],
      ["SpaceXAI", "grok-imagine-video-1.5-720p", 1459, "±5"],
      ["Flux", "flux-3-video-20260811", 1447, "±6"],
      ["Alibaba-ATH", "happyhorse-1.0", 1442, "±10"],
      ["Alibaba", "wan2.7-i2v", 1427, "±5"],
      ["SpaceXAI", "grok-imagine-video-720p", 1415, "±4"],
    ],
  },
  "video-edit": {
    title: { zh: "Video Edit 视频编辑榜", en: "Video editing preference" },
    sourceUrl: "https://arena.ai/leaderboard/video-edit",
    valueLabel: { zh: "Arena Elo", en: "Arena Elo" },
    valueUnit: "",
    rows: [
      ["Alibaba", "wan3.0", 1414, "±26"],
      ["ByteDance Seed", "dreamina-seedance-2.5-720p", 1410, "±26"],
      ["MiniMax", "minimax-h3", 1392, "±19"],
      ["Google", "gemini-omni-flash", 1367, "±15"],
      ["ByteDance Seed", "dreamina-seedance-2.0-720p", 1365, "±14"],
      ["Alibaba-ATH", "happyhorse-1.0", 1307, "±14"],
      ["SpaceXAI", "grok-imagine-video", 1258, "±10"],
      ["Kling", "kling-o3-pro", 1255, "±11"],
      ["Kling", "kling-o1-pro", 1197, "±10"],
      ["Runway", "runway-gen4-aleph", 1182, "±9"],
    ],
  },
};

const SKILL_LEADERBOARD_CATEGORIES = [
  { id: "design", label: { zh: "设计与视觉", en: "Design & visual" } },
  { id: "build", label: { zh: "开发与工程", en: "Build & engineering" } },
  { id: "workflow", label: { zh: "智能体工作流程", en: "Agent workflows" } },
  { id: "content", label: { zh: "内容与表达", en: "Content & delivery" } },
  { id: "data", label: { zh: "数据与后端", en: "Data & backend" } },
];

const LEADERBOARD_COPY = {
  text: { zh: "文本与推理", en: "Text & reasoning", note: { zh: "通用对话、复杂推理与 Agent 任务", en: "General chat, reasoning, and agent tasks" } },
  image: { zh: "图像生成", en: "Image", note: { zh: "概念图、视觉探索与图像生成", en: "Concept art, visual exploration, and image generation" } },
  video: { zh: "视频生成", en: "Video", note: { zh: "镜头、运动、产品与叙事视频", en: "Shots, motion, product, and narrative video" } },
  multimodal: { zh: "多模态", en: "Multimodal", note: { zh: "文本、图像、音频和视觉理解", en: "Text, image, audio, and visual understanding" } },
  coding: { zh: "编程", en: "Coding", note: { zh: "代码生成、仓库理解与开发协作", en: "Code generation, repo understanding, and development" } },
  router: { zh: "模型路由", en: "Router", note: { zh: "多模型选择、路由和成本控制", en: "Model selection, routing, and cost control" } },
};

const LEADERBOARD_SOURCES = {
  text: [
    { name: "Arena", role: { zh: "真人盲测", en: "Human preference" }, href: "https://arena.ai/leaderboard" },
    { name: "Artificial Analysis", role: { zh: "质量 / 速度 / 价格", en: "Quality / speed / price" }, href: "https://artificialanalysis.ai/leaderboards/models" },
    { name: "LiveBench", role: { zh: "持续更新基准", en: "Fresh benchmark" }, href: "https://livebench.ai/" },
    { name: "OpenRouter", role: { zh: "真实 API 选型", en: "API selection" }, href: "https://openrouter.ai/models" },
    { name: "HF Leaderboards", role: { zh: "开源模型", en: "Open models" }, href: "https://huggingface.co/docs/leaderboards/en/index" },
  ],
  image: [
    { name: "Artificial Analysis Image", role: { zh: "图像偏好 / 价格", en: "Image preference / price" }, href: "https://artificialanalysis.ai/image/leaderboard/text-to-image" },
    { name: "Vision Arena", role: { zh: "视觉盲测", en: "Vision preference" }, href: "https://arena.ai/leaderboard/vision" },
    { name: "MMMU", role: { zh: "专业图文推理", en: "Expert multimodal reasoning" }, href: "https://mmmu-benchmark.github.io/" },
    { name: "VLMEvalKit", role: { zh: "开源多模态评测", en: "Open multimodal eval" }, href: "https://github.com/open-compass/VLMEvalKit" },
  ],
  video: [
    { name: "Artificial Analysis", role: { zh: "视频质量 / 速度", en: "Video quality / speed" }, href: "https://artificialanalysis.ai/" },
    { name: "Arena", role: { zh: "真实偏好", en: "Real-world preference" }, href: "https://arena.ai/leaderboard" },
    { name: "OpenRouter", role: { zh: "可调用模型与价格", en: "Available models / price" }, href: "https://openrouter.ai/models" },
  ],
  multimodal: [
    { name: "Vision Arena", role: { zh: "视觉盲测", en: "Vision preference" }, href: "https://arena.ai/leaderboard/vision" },
    { name: "MMMU", role: { zh: "多学科图文推理", en: "Multidiscipline reasoning" }, href: "https://mmmu-benchmark.github.io/" },
    { name: "VLMEvalKit", role: { zh: "统一评测框架", en: "Unified evaluation" }, href: "https://github.com/open-compass/VLMEvalKit" },
    { name: "Artificial Analysis", role: { zh: "综合质量比较", en: "Quality comparison" }, href: "https://artificialanalysis.ai/evaluations" },
  ],
  coding: [
    { name: "LiveBench", role: { zh: "新鲜代码任务", en: "Fresh coding tasks" }, href: "https://livebench.ai/" },
    { name: "Arena", role: { zh: "实际偏好", en: "Real-world preference" }, href: "https://arena.ai/leaderboard" },
    { name: "Artificial Analysis", role: { zh: "能力 / 速度 / 价格", en: "Quality / speed / price" }, href: "https://artificialanalysis.ai/leaderboards/models" },
  ],
  router: [
    { name: "OpenRouter Rankings", role: { zh: "真实用量排行", en: "Real-world usage" }, href: "https://openrouter.ai/rankings" },
    { name: "OpenRouter Models", role: { zh: "价格 / 上下文", en: "Price / context" }, href: "https://openrouter.ai/models" },
  ],
};

const KNOWLEDGE_TYPES = [
  { id: "course", label: { zh: "认知课", en: "Concept course" } },
  { id: "term", label: { zh: "术语词典", en: "Glossary" } },
  { id: "practice", label: { zh: "实战手册", en: "Practice guide" } },
  { id: "reference", label: { zh: "权威资料", en: "Official reference" } },
];

const KNOWLEDGE_DOMAINS = [
  { id: "ai", label: { zh: "AI 基础", en: "AI basics" } },
  { id: "agent", label: { zh: "Agent 系统", en: "Agent systems" } },
  { id: "frontend", label: { zh: "前端", en: "Frontend" } },
  { id: "backend", label: { zh: "后端与 API", en: "Backend & API" } },
  { id: "data", label: { zh: "数据与数据库", en: "Data & databases" } },
  { id: "engineering", label: { zh: "工程与部署", en: "Engineering & deployment" } },
];

const KNOWLEDGE_LEVELS = [
  { id: "starter", label: { zh: "零基础", en: "Starter" } },
  { id: "beginner", label: { zh: "入门", en: "Beginner" } },
  { id: "advanced", label: { zh: "进阶", en: "Advanced" } },
];

const AGENT_RESOURCE_TYPES = [
  { id: "skill", label: { zh: "技能", en: "Skill" } },
  { id: "mcp", label: { zh: "MCP", en: "MCP" } },
];

const AGENT_CATEGORIES = [
  { id: "development", label: { zh: "开发与框架", en: "Development" }, domains: ["开发", "语言/框架"] },
  { id: "orchestration", label: { zh: "Agent 技能与编排", en: "Agent Orchestration" }, domains: ["Agent 技能", "Agent编排"] },
  { id: "engineering", label: { zh: "工程质量", en: "Engineering Quality" }, domains: ["软件工程", "安全", "开发者体验"] },
  { id: "infrastructure", label: { zh: "基础设施与运维", en: "Infrastructure" }, domains: ["基础设施"] },
  { id: "data-ai", label: { zh: "数据与 AI", en: "Data & AI" }, domains: ["人工智能", "数据"] },
  { id: "research", label: { zh: "研究", en: "Research" }, domains: ["研究"] },
  { id: "product-business", label: { zh: "产品与商业", en: "Product & Business" }, domains: ["商业"] },
  { id: "productivity", label: { zh: "效率与自动化", en: "Productivity" }, domains: ["效率工具"] },
  { id: "mcp", label: { zh: "MCP 工具", en: "MCP Tools" }, domains: ["MCP工具"] },
];

const PROMPT_CATEGORIES = [
  { id: "content", label: { zh: "内容与写作", en: "Writing & content" }, tag: "内容类" },
  { id: "research", label: { zh: "研究与分析", en: "Research & analysis" }, tag: "研究类" },
  { id: "design", label: { zh: "设计与生成", en: "Design & generation" }, tag: "设计类" },
  { id: "development", label: { zh: "编程与排错", en: "Coding & debugging" }, tag: "开发类" },
  { id: "data", label: { zh: "数据与结构化", en: "Data & structure" }, tag: "数据类" },
  { id: "operations", label: { zh: "运维与部署", en: "Operations & deployment" }, tag: "运维类" },
  { id: "productivity", label: { zh: "办公与效率", en: "Office & productivity" }, tag: "效率类" },
  { id: "agent", label: { zh: "Agent 配置", en: "Agent configuration" }, tag: "Agent类" },
];

const TOOL_CATEGORIES = [
  { id: "component", label: { zh: "组件库", en: "Component libraries" } },
  { id: "motion", label: { zh: "动效与视觉", en: "Motion & visuals" } },
  { id: "video", label: { zh: "视频与镜头", en: "Video & shots" } },
  { id: "audio", label: { zh: "音频与音乐", en: "Audio & music" } },
  { id: "image", label: { zh: "图像生成", en: "Image generation" } },
  { id: "reference", label: { zh: "案例与灵感", en: "References & inspiration" } },
  { id: "research", label: { zh: "研究与知识", en: "Research & knowledge" } },
  { id: "local-model", label: { zh: "本地模型", en: "Local models" } },
  { id: "data-viz", label: { zh: "数据可视化", en: "Data visualisation" } },
  { id: "design", label: { zh: "设计与原型", en: "Design & prototyping" } },
  { id: "ai-cli", label: { zh: "AI 与 CLI", en: "AI & CLI" } },
];

const PROMPT_ACTIONS = [
  { id: "plan", label: { zh: "规划设计", en: "Plan & design" }, pattern: /架构|设计|规划|策略|方案|蓝图|协议|系统|流程|architect|designer|strategist|planner/i },
  { id: "create", label: { zh: "生成创作", en: "Create" }, pattern: /生成|创作|写作|编写|制作|发布|渲染|generator|writer|author|publisher|artist|creator/i },
  { id: "research", label: { zh: "分析研究", en: "Analyze & research" }, pattern: /研究|调研|分析|洞察|检索|证明|推理|research|analyst|reason|diagnos/i },
  { id: "review", label: { zh: "评审审计", en: "Review & audit" }, pattern: /审计|评审|审核|测试|验证|安全|合规|红队|review|audit|test|security|compliance|red.?team/i },
  { id: "optimize", label: { zh: "优化改进", en: "Optimize" }, pattern: /优化|改进|重构|压缩|润色|校准|提升|修复|optimi|improv|refactor|compress|humanizer|debug/i },
  { id: "automate", label: { zh: "自动化编排", en: "Automate" }, pattern: /自动化|编排|工作流|Agent|循环|工具调用|automation|orchestrat|workflow|agent|operator/i },
  { id: "learn", label: { zh: "教学辅导", en: "Teach & coach" }, pattern: /学习|教育|辅导|教练|培训|导师|learning|education|coach|mentor|tutor/i },
  { id: "resource", label: { zh: "资料与入口", en: "Resources" }, pattern: /资源入口|报名入口|外部链接|注册入口|社区|许可证|订阅|频道|电子书|纸质书|文档入口|提交页|阅读入口|resource|documentation/i },
  { id: "direct", label: { zh: "直接使用", en: "Direct use" }, fallback: true },
];

const state = {
  currentLang: "zh",
  currentView: "home",
  activeTaskId: null,
  activeTaskChannel: null,
  activeMode: "all",
  secondaryMode: "all",
  visibleCount: PAGE_SIZE,
  items: [],
  content: {},
  researchContent: null,
  contentPromise: null,
  contentStatus: "idle",
  contentBoundaryReady: false,
  blockedLegacy: new Set(),
  structuredDetailFailed: false,
  copyFeedback: new Map(),
  favorites: new Set(),
  selectedId: null,
  lastTrigger: null,
  panelRawContent: "",
  loadPromise: null,
  modelLeaderboardCategory: "text",
  modelLeaderboardView: "models",
  leaderboardMetric: "intelligence",
  artificialAnalysis: null,
  modelCatalog: [],
  mediaModelLeaderboards: null,
  skillLeaderboardCategory: "design",
  skillLeaderboard: null,
  workflows: [],
  workflowStatus: "idle",
  workflowPromise: null,
  workflowExpanded: false,
  workflowTaskFilter: null,
  selectedWorkflowId: null,
  workflowLastTrigger: null,
  homeLeaderboardMetric: "text",
  recentItems: [],
  workspaceReadErrors: new Set(),
  workspaceSaveErrors: new Set(),
  workspaceRollbackFailed: false,
  workspaceImportPending: false,
  promptBodies: {},
  modelLeaderboardSubcategories: {
    text: "text",
    code: "webdev",
    image: "text-to-image",
    video: "text-to-video",
  },
};

const dom = {};
let searchTimer = 0;

function cacheDom() {
  const ids = [
    "mainContent", "viewEyebrow", "viewTitle", "viewSubtitle", "viewTaskStatus", "viewCount",
    "taskEntrySection", "taskEntryGrid", "workflowOverview", "workflowGrid", "workflowViewAll",
    "surfaceOverview", "surfaceGrid", "headerSearch", "searchInput", "searchToggle", "clearSearch", "libraryEyebrow", "libraryTitle", "libraryToolbar", "primaryFilterLabel", "secondaryFilterAxis", "secondaryFilterLabel", "modeTabsFrame", "modeTabs", "modeTabsPrev", "modeTabsNext", "secondaryTabsFrame", "secondaryTabs", "secondaryTabsPrev", "secondaryTabsNext", "resultCount",
    "savedFilter", "resetFilters", "contentGrid", "emptyState", "emptyTitle", "emptyHint", "emptyAction", "loadMoreWrap",
    "loadMore", "loadMoreCount", "langToggle", "sidebarToggle", "panelBackdrop", "detailPanel", "panelType",
    "panelId", "panelSave", "panelClose", "panelVisual", "panelLogo", "panelMonogram", "panelTitle",
    "panelSummary", "panelDecisionUseLabel", "panelDecisionUse", "panelDecisionTypeLabel", "panelDecisionType", "panelDecisionUpdatedLabel", "panelDecisionUpdated", "panelDomainRow", "panelDomain", "panelUpdated", "panelSources", "panelTags", "panelNext",
    "panelContent", "copyContent", "panelSourceLink", "loadingOverlay", "loadingTitle",
    "modelLeaderboard", "modelRankView", "modelRankTabs", "modelRankSubtabs", "modelRankBoard", "skillLeaderboard", "skillRankTabs", "skillRankBoard", "homeLeaderboard", "homeLeaderboardTabs", "homeLeaderboardBoard",
    "panelRelatedSection", "panelRelated",
  ];
  for (const id of ids) dom[id] = document.getElementById(id);
}

function readStorage(key, fallback = "") {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private browsing can disable localStorage. The page remains usable in memory.
  }
}

function validWorkspaceIds(value, limit = 5000) {
  return Array.isArray(value) && value.length <= limit && value.every((id) => (
    typeof id === "string" && id.length > 0 && id.length <= 200
    && id.trim() === id && !/[\u0000-\u001f\u007f]/u.test(id)
  ));
}

function readWorkspaceIds(key, limit = 5000) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    if (!validWorkspaceIds(value)) throw new Error("Invalid saved IDs");
    state.workspaceReadErrors.delete(key);
    return [...new Set(value)].slice(0, limit);
  } catch {
    state.workspaceReadErrors.add(key);
    return [];
  }
}

function workspaceErrorKey() {
  if (state.workspaceRollbackFailed) return "workspacePartialSaveError";
  if (state.workspaceReadErrors.size) return "workspaceReadError";
  if (state.workspaceSaveErrors.size) return "workspaceSaveError";
  return null;
}

function showWorkspaceMessage(key, success = false) {
  let notice = document.getElementById("workspaceMessage");
  if (!notice) {
    notice = createElement("div", "workspace-message");
    notice.id = "workspaceMessage";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    const text = document.createElement("p");
    const close = createElement("button", "icon-button");
    close.type = "button";
    close.append(createIcon("x"));
    close.addEventListener("click", () => { notice.hidden = true; });
    notice.append(text, close);
    document.body.append(notice);
  }
  notice.dataset.message = key;
  notice.dataset.tone = success ? "success" : "error";
  notice.querySelector("p").textContent = translate(key);
  notice.querySelector("button").title = translate("close");
  notice.querySelector("button").setAttribute("aria-label", translate("close"));
  notice.hidden = false;
}

function persistWorkspacePatch(patch, { replaceUnreadable = false } = {}) {
  const entries = Object.entries(patch);
  const originals = new Map();
  const written = [];
  try {
    if (!replaceUnreadable && entries.some(([key]) => state.workspaceReadErrors.has(key))) {
      throw new Error("Existing data cannot be safely replaced");
    }
    for (const [key] of entries) originals.set(key, window.localStorage.getItem(key));
    for (const [key, value] of entries) {
      window.localStorage.setItem(key, value);
      written.push(key);
    }
  } catch {
    for (const key of written.reverse()) {
      try {
        const previous = originals.get(key);
        if (previous === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, previous);
      } catch {
        state.workspaceRollbackFailed = true;
        // Keep the in-memory snapshot if browser storage also rejects rollback.
      }
    }
    entries.forEach(([key]) => state.workspaceSaveErrors.add(key));
    showWorkspaceMessage(workspaceErrorKey());
    return false;
  }
  entries.forEach(([key]) => {
    state.workspaceReadErrors.delete(key);
    state.workspaceSaveErrors.delete(key);
  });
  if (entries.some(([key]) => key === STORAGE_KEYS.favorites) && entries.some(([key]) => key === STORAGE_KEYS.recent)) {
    state.workspaceRollbackFailed = false;
  }
  if (!workspaceErrorKey()) {
    const notice = document.getElementById("workspaceMessage");
    if (notice) notice.hidden = true;
  }
  return true;
}

function translate(key, ...args) {
  const value = I18N[state.currentLang]?.[key] ?? I18N.zh[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function localized(value, fallback = "", language = state.currentLang) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return value[language] ?? value.en ?? value.zh ?? fallback;
  return value ?? fallback;
}

function localizedText(value, fallback = "", language = state.currentLang) {
  const result = localized(value, fallback, language);
  return Array.isArray(result) ? result.join(" · ") : String(result || fallback);
}

function normalizeText(value) {
  return String(value ?? "").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function isExcludedModelRecord(model) {
  return /\bterra\b/i.test([
    localizedText(model?.title, "", "zh"),
    localizedText(model?.title, "", "en"),
    model?.id,
    model?.modelId,
  ].filter(Boolean).join(" "));
}

function compactCount(value) {
  if (value < 1000) return String(value);
  const thousands = value / 1000;
  return `${thousands.toFixed(thousands >= 10 ? 0 : 1).replace(/\.0$/, "")}k`;
}

function formatCount(value) {
  return new Intl.NumberFormat(state.currentLang === "zh" ? "zh-CN" : "en-US").format(value);
}

function taskEntryForId(id) {
  return TASK_ENTRIES.find((entry) => entry.id === id) || null;
}

function applyTaskFilters(taskId) {
  const entry = taskEntryForId(taskId);
  if (!entry) return;
  const channel = taskChannelForId(taskId, state.activeTaskChannel);
  if (channel?.kind === "workflows") {
    state.activeMode = "all";
    state.secondaryMode = "all";
    return;
  }
  const filters = channel?.filters || entry.filters;
  state.activeMode = filters?.primary || "all";
  state.secondaryMode = filters?.secondary || "all";
}

function workflowCategoryLabel(category) {
  const key = typeof category === "object" && category ? (category.id || category.en || localizedText(category, "")) : category;
  const label = window.KnowledgeCosmosWorkflowUI.categoryLabel(key, state.currentLang);
  const text = typeof label === "string" ? label : localizedText(label, localizedText(category, ""));
  if (!text || text === "workflow") return state.currentLang === "zh" ? "工作流" : "Workflow";
  return text;
}

function workflowDifficultyLabel(difficulty) {
  return window.KnowledgeCosmosWorkflowUI.difficultyLabel(difficulty, state.currentLang);
}

function workflowStatusLabel(status) {
  return window.KnowledgeCosmosWorkflowUI.statusLabel(status, state.currentLang);
}

function renderTaskEntries() {
  if (!dom.taskEntrySection || !dom.taskEntryGrid) return;
  const isHome = state.currentView === "home";
  dom.taskEntrySection.hidden = !isHome;
  if (!isHome) return;
  dom.taskEntryGrid.replaceChildren();
  for (const entry of TASK_ENTRIES) {
    const card = createElement("article", "task-entry");
    card.dataset.taskId = entry.id;
    card.setAttribute("role", "listitem");
    card.classList.toggle("is-active", state.activeTaskId === entry.id);
    const primary = createElement("button", "task-entry-primary");
    primary.type = "button";
    primary.dataset.taskPrimary = entry.id;
    primary.append(
      createElement("span", "task-entry-index", String(TASK_ENTRIES.indexOf(entry) + 1).padStart(2, "0")),
      createElement("strong", "task-entry-label", localizedText(entry.label)),
      createElement("span", "task-entry-description", localizedText(entry.description)),
      createElement("span", "task-entry-arrow", String.fromCodePoint(0x2192)),
    );
    card.append(primary);
    const channels = taskChannelsForId(entry.id);
    if (channels.length) {
      const channelNav = createElement("div", "task-entry-channels");
      channelNav.setAttribute("aria-label", state.currentLang === "zh" ? `${localizedText(entry.label)}资源类型` : `${localizedText(entry.label, "", "en")} resource types`);
      for (const channel of channels) {
        const channelButton = createElement("button", "task-entry-channel");
        channelButton.type = "button";
        channelButton.dataset.taskAction = channel.id;
        channelButton.dataset.taskId = entry.id;
        channelButton.title = localizedText(channel.description);
        channelButton.classList.toggle("is-active", state.activeTaskId === entry.id && state.activeTaskChannel === channel.id);
        channelButton.append(
          createElement("strong", "task-entry-channel-label", localizedText(channel.label)),
          createElement("span", "task-entry-channel-description", localizedText(channel.description)),
        );
        channelNav.append(channelButton);
      }
      card.append(channelNav);
    }
    dom.taskEntryGrid.append(card);
  }
}

function activateTask(taskId) {
  const entry = taskEntryForId(taskId);
  if (!entry) return;
  const defaultChannel = taskChannelForId(taskId, entry.defaultChannel) || taskChannelsForId(taskId)[0];
  activateTaskChannel(taskId, defaultChannel?.id || null);
}

function activateTaskChannel(taskId, channelId) {
  const entry = taskEntryForId(taskId);
  const channel = taskChannelForId(taskId, channelId);
  if (!entry || !channel) return;
  state.activeTaskChannel = channel.id;
  state.workflowTaskFilter = channel.kind === "workflows" ? entry.id : null;
  if (channel.kind === "workflows") {
    window.KnowledgeCosmosEntry?.dismiss?.({ force: true });
    state.currentView = "home";
    state.activeTaskId = entry.id;
    state.workflowExpanded = true;
    state.activeMode = "all";
    state.secondaryMode = "all";
    updateHash("home", false, entry.id, channel.id);
    renderAll();
    window.requestAnimationFrame(() => dom.workflowOverview?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return;
  }
  switchView(channel.targetView, { taskId: entry.id, taskChannel: channel.id, force: true, userInitiated: true });
  state.visibleCount = pageSizeForView(channel.targetView);
  renderAll();
  window.requestAnimationFrame(() => dom.mainContent.focus({ preventScroll: true }));
}

function workflowEligibleForHome(workflow) {
  return window.KnowledgeCosmosWorkflowUI.isEligibleForHome(workflow);
}

function renderWorkflowOverview() {
  return window.KnowledgeCosmosWorkflowUI.renderOverview({
    state: { ...state, taskEntries: TASK_ENTRIES },
    dom,
    createElement,
  });
}

function surfaceForItem(item) {
  if (item.category === "MCP") return "agents";
  if (SURFACE_ORDER.includes(item.view)) return item.view;
  if (item.category === "models") return "models";
  return "knowledge";
}

function modelCompanyForItem(item) {
  return MODEL_COMPANIES.find((company) => company.id === item.company) || null;
}

function surfacesForItem(item) {
  const primarySurface = surfaceForItem(item);
  if (item.category === "MCP") return ["agents"];
  return [primarySurface];
}

function categoryDefinitionsForView(view) {
  if (view === "agents") return AGENT_CATEGORIES;
  if (view === "prompts") return PROMPT_CATEGORIES;
  return [];
}

function categoryIdsForItem(item, surface) {
  if (surface === "agents") {
    if (item.category === "MCP") return ["mcp"];
    const domain = localizedText(item.domain, "", "zh");
    const match = AGENT_CATEGORIES.find((category) => category.domains.includes(domain));
    return match ? [match.id] : [];
  }
  if (surface === "prompts") {
    const tags = localized(item.tags, [], "zh");
    const normalizedTags = Array.isArray(tags) ? tags : [tags];
    const priority = ["Agent类", "开发类", "研究类", "设计类", "内容类", "数据类", "运维类", "效率类"];
    const tag = priority.find((candidate) => normalizedTags.includes(candidate));
    const match = PROMPT_CATEGORIES.find((category) => category.tag === tag);
    return match ? [match.id] : [];
  }
  return [];
}

function modelTypeIdsForItem(item) {
  return MODEL_TYPE_GROUPS
    .filter((group) => group.types.includes(item.modelType))
    .map((group) => group.id);
}

function leaderboardMetricForId(id) {
  return AA_LEADERBOARD_METRICS.find((metric) => metric.id === id) || AA_LEADERBOARD_METRICS[0];
}

function modelLeaderboardCategoryForId(id) {
  return MODEL_LEADERBOARD_CATEGORIES.find((category) => category.id === id) || MODEL_LEADERBOARD_CATEGORIES[0];
}

function leaderboardSubcategoriesForCategory(category) {
  return Array.isArray(category?.subcategories) ? category.subcategories : [];
}

function activeLeaderboardSubcategory(category) {
  const subcategories = leaderboardSubcategoriesForCategory(category);
  if (!subcategories.length) return null;
  const selectedId = state.modelLeaderboardSubcategories[category.id];
  return subcategories.find((subcategory) => subcategory.id === selectedId) || subcategories[0];
}

function activeArenaLeaderboardId(category) {
  const subcategory = activeLeaderboardSubcategory(category);
  return subcategory?.leaderboardId || category.defaultLeaderboard || category.id;
}

function leaderboardLabelForId(category, leaderboardId) {
  if (category.id === "overview") {
    const parent = MODEL_LEADERBOARD_CATEGORIES.find((item) => {
      if (item.kind !== "arena") return false;
      return leaderboardSubcategoriesForCategory(item).some((subcategory) => subcategory.leaderboardId === leaderboardId)
        || (item.defaultLeaderboard || item.id) === leaderboardId;
    });
    return parent ? leaderboardLabelForId(parent, leaderboardId) : localizedText(category.label);
  }
  const subcategory = leaderboardSubcategoriesForCategory(category).find((item) => item.leaderboardId === leaderboardId);
  if (subcategory) return `${localizedText(category.label)} · ${localizedText(subcategory.label)}`;
  return localizedText(category.label);
}

function arenaLeaderboardIdsForCategory(category) {
  if (category.id === "overview") {
    return MODEL_LEADERBOARD_CATEGORIES
      .filter((item) => item.kind === "arena")
      .flatMap((item) => {
        const subcategories = leaderboardSubcategoriesForCategory(item);
        return subcategories.length ? subcategories.map((subcategory) => subcategory.leaderboardId) : [item.defaultLeaderboard || item.id];
      });
  }
  const subcategories = leaderboardSubcategoriesForCategory(category);
  return subcategories.length ? subcategories.map((subcategory) => subcategory.leaderboardId) : [category.defaultLeaderboard || category.id];
}

function leaderboardDatasetsForCategory(category) {
  if (category.kind === "general") {
    const metric = leaderboardMetricForId(state.leaderboardMetric);
    return [{
      id: "general",
      label: localizedText(category.label),
      source: "Artificial Analysis",
      sourceUrl: state.artificialAnalysis?.source_url || "https://artificialanalysis.ai/leaderboards/models",
      capturedAt: state.artificialAnalysis?.captured_at,
      rows: leaderboardSnapshotRows(metric.id).map((model, index) => ({
        rank: index + 1,
        creator: model.creator,
        name: model.name,
        score: analysisMetricValue(model, metric),
        confidence: "",
      })),
    }];
  }
  if (category.kind === "media") {
    const media = mediaLeaderboardForId(category.id);
    if (!media?.models?.length) return [];
    return [{
      id: category.id,
      label: localizedText(category.label),
      source: "Artificial Analysis",
      sourceUrl: media.source_url,
      capturedAt: state.mediaModelLeaderboards?.captured_at,
      rows: media.models.map((model) => ({
        rank: model.rank,
        creator: model.creator,
        name: model.name,
        score: model.elo,
        confidence: model.confidence_interval,
      })),
    }];
  }

  return arenaLeaderboardIdsForCategory(category)
    .map((id) => {
      const leaderboard = arenaLeaderboardForId(id);
      if (!leaderboard) return null;
      return {
        id,
        label: leaderboardLabelForId(category, id),
        source: "Arena",
        sourceUrl: leaderboard.sourceUrl,
        capturedAt: ARENA_SNAPSHOT_DATE,
        rows: arenaLeaderboardRows(id),
      };
    })
    .filter(Boolean);
}

function providerPerformanceForCategory(category) {
  const providers = new Map();
  for (const dataset of leaderboardDatasetsForCategory(category)) {
    for (const row of dataset.rows) {
      const key = normalizeText(row.creator);
      if (!key) continue;
      const previous = providers.get(key) || {
        creator: row.creator,
        bestRank: row.rank,
        appearances: [],
      };
      previous.bestRank = Math.min(previous.bestRank, row.rank);
      const existing = previous.appearances.find((item) => item.datasetId === dataset.id);
      const appearance = {
        datasetId: dataset.id,
        label: dataset.label,
        source: dataset.source,
        sourceUrl: dataset.sourceUrl,
        rank: row.rank,
        name: row.name,
        score: row.score,
        confidence: row.confidence,
      };
      if (!existing || appearance.rank < existing.rank) {
        if (existing) Object.assign(existing, appearance);
        else previous.appearances.push(appearance);
      }
      providers.set(key, previous);
    }
  }

  return [...providers.values()]
    .map((provider) => ({
      ...provider,
      appearances: provider.appearances.sort((left, right) => left.rank - right.rank || left.label.localeCompare(right.label)),
    }))
    .sort((left, right) => right.appearances.length - left.appearances.length || left.bestRank - right.bestRank || left.creator.localeCompare(right.creator));
}

function mediaLeaderboardForId(id) {
  return state.mediaModelLeaderboards?.leaderboards?.find((leaderboard) => leaderboard.id === id) || null;
}

function arenaLeaderboardForId(id) {
  return ARENA_LEADERBOARD_SNAPSHOTS[id] || null;
}

function arenaLeaderboardRows(id) {
  const leaderboard = arenaLeaderboardForId(id);
  if (!leaderboard) return [];
  return leaderboard.rows
    .filter(([, name]) => !/\bterra\b/i.test(String(name || "")))
    .map(([creator, name, score, confidence], index) => ({
      rank: index + 1,
      creator,
      name,
      score,
      confidence,
      modelUrl: leaderboard.sourceUrl,
    }));
}

function analysisMetricValue(model, metric) {
  if (metric.id !== "context") return Number.isFinite(model?.[metric.key]) ? model[metric.key] : null;
  const raw = String(model?.context_window || "").trim().replace(/,/g, "").toLowerCase();
  const match = raw.match(/^([\d.]+)\s*([km])?$/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  return value * (match[2] === "m" ? 1_000_000 : match[2] === "k" ? 1_000 : 1);
}

function leaderboardSnapshotRows(metricId) {
  const metric = leaderboardMetricForId(metricId);
  const models = Array.isArray(state.artificialAnalysis?.models) ? state.artificialAnalysis.models : [];
  return models
    .filter((model) => !/\bterra\b/i.test(`${model.name || ""} ${model.model_url || ""}`))
    .sort((left, right) => {
      const leftValue = analysisMetricValue(left, metric);
      const rightValue = analysisMetricValue(right, metric);
      if (leftValue === null && rightValue === null) return 0;
      if (leftValue === null) return 1;
      if (rightValue === null) return -1;
      const delta = rightValue - leftValue;
      return metric.direction === "asc" ? -delta : delta;
    })
}

function findCatalogModel(snapshotModel) {
  const target = normalizeText(snapshotModel.name);
  return state.items.find((item) => item._surface === "models" && [localizedText(item.title), item.modelId, item.id].some((value) => normalizeText(value) === target)) || null;
}

function analysisCreatorLogo(snapshotModel) {
  const creator = normalizeText(snapshotModel.creator);
  const modelName = normalizeText(snapshotModel.name);
  if (creator === "alibaba" && !modelName.includes("qwen")) return null;
  if (ANALYSIS_CREATOR_LOGOS[creator]) return ANALYSIS_CREATOR_LOGOS[creator];
  const company = MODEL_COMPANIES.find((candidate) => {
    const label = normalizeText(localizedText(candidate.label));
    return creator === label || creator.includes(label) || label.includes(creator) || (creator.includes("spacexai") && candidate.id === "xai");
  });
  return company?.logo || null;
}

function analysisCreatorDisplayName(snapshotModel) {
  const creator = normalizeText(snapshotModel.creator);
  if (creator === "spacexai" && normalizeText(snapshotModel.name).includes("grok")) return "xAI";
  return String(snapshotModel.creator || "AI");
}

function analysisCreatorAccent(creator) {
  const normalizedCreator = normalizeText(creator);
  const company = MODEL_COMPANIES.find((candidate) => {
    const label = normalizeText(localizedText(candidate.label));
    return normalizedCreator === label || normalizedCreator.includes(label) || label.includes(normalizedCreator) || (normalizedCreator.includes("spacexai") && candidate.id === "xai");
  });
  return company?.accent || "#6a746e";
}

function applyLeaderboardLogoFallbacks(root = dom.modelRankBoard) {
  root.querySelectorAll("img[data-logo-fallback]").forEach((image) => {
    image.addEventListener("error", () => {
      const fallback = createElement("span", "leaderboard-provider-mark");
      fallback.setAttribute("aria-label", image.alt || "Provider");
      fallback.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6.5"></circle><path d="M12 3v3M12 18v3M3 12h3M18 12h3"></path></svg>';
      image.replaceWith(fallback);
    }, { once: true });
  });
}

function providerFallbackMarkup() {
  return '<span class="leaderboard-provider-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6.5"></circle><path d="M12 3v3M12 18v3M3 12h3M18 12h3"></path></svg></span>';
}

function formatAnalysisNumber(value, metric) {
  if (!Number.isFinite(value)) return "—";
  if (metric.id === "intelligence") return String(Math.round(value));
  if (metric.id === "cost") return `$${value < 1 ? value.toFixed(2) : value.toFixed(2)}`;
  if (metric.id === "context") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 ? 2 : 0)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
    return String(Math.round(value));
  }
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(2)}${metric.unit}`;
}

function leaderboardSnapshotDate(value) {
  const raw = String(value || "");
  const date = raw ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00` : raw) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(state.currentLang === "zh" ? "zh-CN" : "en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date).replaceAll("/", ".");
}

function leaderboardEvidenceMarkup({ source, capturedAt, rows, independent = true, coverageLabel, coverageValue }) {
  const stale = !capturedAt || !Number.isFinite(Date.parse(capturedAt))
    || Date.now() - Date.parse(capturedAt) > 10 * 86_400_000;
  const items = [
    [state.currentLang === "zh" ? "数据源" : "Source", String(source).includes("Arena")
      ? `${source} · ${state.currentLang === "zh" ? "历史摘要" : "Historical subset"}`
      : source],
    [state.currentLang === "zh" ? "快照" : "Snapshot", `${leaderboardSnapshotDate(capturedAt)}${stale ? (state.currentLang === "zh" ? " · 待更新" : " · Stale") : ""}`],
    [coverageLabel || (state.currentLang === "zh" ? "覆盖" : "Coverage"), coverageValue || `${rows} ${state.currentLang === "zh" ? "个模型" : "models"}`],
  ];
  if (independent) items.push([state.currentLang === "zh" ? "计分" : "Scoring", state.currentLang === "zh" ? "任务独立" : "Task-specific"]);
  return `<div class="leaderboard-evidence-bar" data-freshness="${stale ? "stale" : "fresh"}" data-captured-at="${escapeHTML(String(capturedAt || ""))}">${items.map(([label, value]) => `<span><small>${escapeHTML(label)}</small><b>${escapeHTML(String(value))}</b></span>`).join("")}</div>`;
}

function renderModelSummary() {
  const leaderboard = arenaLeaderboardForId("chat");
  const rows = arenaLeaderboardRows("chat").slice(0, 5);
  const sourceUrl = leaderboard?.sourceUrl || "https://arena.ai/leaderboard/text";
  const snapshotDate = ARENA_SNAPSHOT_DATE;
  if (!rows.length) {
    dom.modelRankBoard.innerHTML = `<div class="leaderboard-empty">${state.currentLang === "zh" ? "模型摘要暂时没有可用数据。" : "The model summary is temporarily unavailable."}</div>`;
    return;
  }
  const rowsMarkup = rows.map((row) => {
    const creatorName = analysisCreatorDisplayName(row);
    const logo = analysisCreatorLogo(row);
    return `<a class="leaderboard-summary-row" href="${escapeHTML(row.modelUrl)}" target="_blank" rel="noreferrer"><span class="leaderboard-summary-rank">${String(row.rank).padStart(2, "0")}</span><span class="leaderboard-summary-model"><span class="leaderboard-track-logo">${logo ? `<img src="${logo}" alt="${escapeHTML(creatorName)}" loading="lazy" data-logo-fallback>` : providerFallbackMarkup()}</span><span><small>${escapeHTML(creatorName)}</small><strong>${escapeHTML(row.name)}</strong></span></span><span class="leaderboard-summary-task">Chat</span><span class="leaderboard-summary-score"><b>${escapeHTML(String(row.score))}</b><small>${escapeHTML(row.confidence || "—")}</small></span></a>`;
  }).join("");
  const directoryButton = createElement("button", "secondary-button leaderboard-directory-button", state.currentLang === "zh" ? "查看完整模型目录" : "View full model directory");
  directoryButton.type = "button";
  directoryButton.dataset.viewTarget = "models";
  dom.modelRankView.replaceChildren();
  dom.modelRankTabs.replaceChildren();
  dom.modelRankSubtabs.replaceChildren();
  dom.modelRankSubtabs.hidden = true;
  dom.modelRankBoard.innerHTML = `<div class="leaderboard-board-head"><div><h3>${state.currentLang === "zh" ? "先看一组可比较的模型" : "A quick model comparison"}</h3></div><a class="leaderboard-source-link" href="${escapeHTML(sourceUrl)}" target="_blank" rel="noreferrer" aria-label="打开模型榜单来源">↗</a></div>${leaderboardEvidenceMarkup({ source: "Arena", capturedAt: snapshotDate, rows: rows.length, coverageLabel: state.currentLang === "zh" ? "任务类型" : "Task", coverageValue: "Chat" })}<div class="leaderboard-summary-legend"><span>${state.currentLang === "zh" ? "排名" : "Rank"}</span><span>${state.currentLang === "zh" ? "模型 / 提供方" : "Model / creator"}</span><span>${state.currentLang === "zh" ? "任务" : "Task"}</span><span>${state.currentLang === "zh" ? "主要指标" : "Metric"}</span></div><div class="leaderboard-summary-list">${rowsMarkup}</div>`;
  dom.modelRankBoard.append(directoryButton);
  applyLeaderboardLogoFallbacks();
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);
}

function skillLeaderboardCategoryForId(id) {
  return SKILL_LEADERBOARD_CATEGORIES.find((category) => category.id === id) || SKILL_LEADERBOARD_CATEGORIES[0];
}

function skillLeaderboardRows(categoryId) {
  const skills = Array.isArray(state.skillLeaderboard?.skills) ? [...state.skillLeaderboard.skills] : [];
  return skills
    .filter((skill) => skill.category === categoryId)
    .sort((left, right) => right.latest_week_installs - left.latest_week_installs || right.installs - left.installs);
}

function skillLeaderboardCategoryIcon(categoryId) {
  const icons = {
    design: `<svg class="skill-category-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4" width="17" height="15.5" rx="2.5"></rect><path d="M3.5 9h17"></path><circle cx="7" cy="6.5" r=".8" fill="currentColor" stroke="none"></circle><circle cx="9.5" cy="6.5" r=".8" fill="currentColor" stroke="none"></circle><path d="m8 16 3-3 2.25 2.25 2-2 2.75 2.75"></path></svg>`,
    build: `<svg class="skill-category-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><path d="m8 10 3 2.5L8 15"></path><path d="M13.5 15h3"></path></svg>`,
    workflow: `<svg class="skill-category-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6.5" cy="6.5" r="2"></circle><circle cx="17.5" cy="12" r="2"></circle><circle cx="6.5" cy="17.5" r="2"></circle><path d="M8.2 7.5 15.8 11"></path><path d="m8.2 16.5 7.6-3.5"></path></svg>`,
    content: `<svg class="skill-category-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6z"></path><path d="M14 3.5v4h4"></path><path d="M9 12h6"></path><path d="M9 15.5h6"></path></svg>`,
    data: `<svg class="skill-category-icon" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6.5" rx="6.5" ry="2.75"></ellipse><path d="M5.5 6.5v5.5c0 1.5 2.9 2.75 6.5 2.75s6.5-1.25 6.5-2.75V6.5"></path><path d="M5.5 12v5.5c0 1.5 2.9 2.75 6.5 2.75s6.5-1.25 6.5-2.75V12"></path></svg>`,
  };
  return icons[categoryId] || icons.workflow;
}

function renderSkillLeaderboard() {
  if (!dom.skillLeaderboard || !dom.skillRankTabs || !dom.skillRankBoard) return;
  dom.skillLeaderboard.hidden = state.currentView !== "home";
  if (state.currentView !== "home") return;

  const activeCategory = skillLeaderboardCategoryForId(state.skillLeaderboardCategory);
  dom.skillRankTabs.replaceChildren();
  for (const category of SKILL_LEADERBOARD_CATEGORIES) {
    const button = createElement("button", "leaderboard-tab");
    button.type = "button";
    button.dataset.skillLeaderboardCategory = category.id;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(state.skillLeaderboardCategory === category.id));
    button.classList.toggle("is-active", state.skillLeaderboardCategory === category.id);
    button.append(createElement("strong", "", localizedText(category.label)));
    dom.skillRankTabs.append(button);
  }

  const ranked = skillLeaderboardRows(activeCategory.id);
  if (!ranked.length) {
    dom.skillRankBoard.innerHTML = `<div class="leaderboard-empty">${state.currentLang === "zh" ? "技能榜单快照暂时没有可用数据。" : "The Skill leaderboard snapshot has no usable data yet."}</div>`;
    return;
  }

  const previewRows = ranked.slice(0, 5);
  const trackMarkup = previewRows.map((skill, index) => {
    const rank = index + 1;
    const accent = skill.is_official ? "#2f7187" : "#795f9b";
    const status = skill.is_official ? (state.currentLang === "zh" ? "官方来源" : "Official") : (state.currentLang === "zh" ? "公开来源" : "Public source");
    const title = localizedText(skill.title, skill.name);
    return `<a class="leaderboard-track-row skill-track-row ${rank <= 3 ? `leaderboard-track-row-top leaderboard-track-row-${rank}` : ""}" href="${escapeHTML(skill.skill_url)}" target="_blank" rel="noreferrer" style="--rank-accent:${accent}">
      <span class="leaderboard-track-rank">${String(rank).padStart(2, "0")}</span>
      <span class="leaderboard-track-model"><span class="leaderboard-track-logo skill-track-logo" data-skill-category="${escapeHTML(skill.category)}">${skillLeaderboardCategoryIcon(skill.category)}<i></i></span><span class="leaderboard-track-copy"><small>${escapeHTML(skill.source)}</small><strong>${escapeHTML(title)}</strong><em>${escapeHTML(skill.description || "")}</em></span></span>
      <span class="leaderboard-track-value is-primary"><b>${formatCount(skill.latest_week_installs)}</b><small>${state.currentLang === "zh" ? "最近一周" : "LAST WEEK"}</small></span>
      <span class="leaderboard-track-value"><b>${formatCount(skill.installs)}</b><small>${state.currentLang === "zh" ? "累计安装" : "ALL TIME"}</small></span>
      <span class="leaderboard-skill-status"><b>${escapeHTML(status)}</b><small>${escapeHTML(skill.source)}</small></span>
    </a>`;
  }).join("");

  dom.skillRankBoard.dataset.category = activeCategory.id;
  dom.skillRankBoard.innerHTML = `<div class="leaderboard-board-head"><div><h3>${localizedText(activeCategory.label)}</h3></div></div>${leaderboardEvidenceMarkup({ source: "skills.sh", capturedAt: state.skillLeaderboard?.captured_at, rows: ranked.length, independent: false, coverageLabel: state.currentLang === "zh" ? "精选" : "Selected", coverageValue: `${ranked.length}` })}<div class="leaderboard-track-legend skill-track-legend"><span>${state.currentLang === "zh" ? "热度序" : "Popularity"}</span><span>${state.currentLang === "zh" ? "技能" : "Skill"}</span><span>${state.currentLang === "zh" ? "最近一周" : "Last week"}</span><span>${state.currentLang === "zh" ? "累计安装" : "All time"}</span><span>${state.currentLang === "zh" ? "来源" : "Source"}</span></div><div class="leaderboard-track skill-track">${trackMarkup}</div>`;
}

function renderGeneralLeaderboard() {
  const activeMetric = leaderboardMetricForId(state.leaderboardMetric);
  const ranked = leaderboardSnapshotRows(activeMetric.id);
  if (!ranked.length) {
    dom.modelRankBoard.innerHTML = `<div class="leaderboard-empty">${state.currentLang === "zh" ? "Artificial Analysis 快照暂时没有可用数据。" : "The Artificial Analysis snapshot has no usable data yet."}</div>`;
    return;
  }

  const trackMarkup = ranked.map((model, index) => {
    const rank = index + 1;
    const primaryValue = formatAnalysisNumber(analysisMetricValue(model, activeMetric), activeMetric);
    const accent = index === 0 ? "#2f7a60" : index === 1 ? "#5665a8" : index === 2 ? "#a65b4f" : "#6a746e";
    const creatorLogo = analysisCreatorLogo(model);
    const creatorName = analysisCreatorDisplayName(model);
    return `<a class="leaderboard-track-row ${rank <= 3 ? `leaderboard-track-row-top leaderboard-track-row-${rank}` : ""}" href="${model.model_url}" target="_blank" rel="noreferrer" style="--rank-accent:${accent}">
      <span class="leaderboard-track-rank">${String(rank).padStart(2, "0")}</span>
      <span class="leaderboard-track-model"><span class="leaderboard-track-logo">${creatorLogo ? `<img src="${creatorLogo}" alt="${escapeHTML(creatorName)}" loading="lazy" data-logo-fallback>` : providerFallbackMarkup()}<i></i></span><span class="leaderboard-track-copy"><small>${escapeHTML(creatorName)}</small><strong>${model.name}</strong></span></span>
      <span class="leaderboard-track-value leaderboard-track-context"><b>${model.context_window || "—"}</b><small>CONTEXT</small></span>
      <span class="leaderboard-track-value ${activeMetric.id === "intelligence" ? "is-primary" : ""}"><b>${activeMetric.id === "intelligence" ? primaryValue : formatAnalysisNumber(model.intelligence_index, leaderboardMetricForId("intelligence"))}</b><small>INDEX</small></span>
      <span class="leaderboard-track-value ${activeMetric.id === "cost" ? "is-primary" : ""}"><b>${formatAnalysisNumber(model.cost_per_task_usd, leaderboardMetricForId("cost"))}</b><small>USD / TASK</small></span>
      <span class="leaderboard-track-value ${activeMetric.id === "speed" ? "is-primary" : ""}"><b>${formatAnalysisNumber(model.median_tokens_per_second, leaderboardMetricForId("speed"))}</b><small>TOKENS/S</small></span>
      <span class="leaderboard-track-value ${activeMetric.id === "latency" ? "is-primary" : ""}"><b>${formatAnalysisNumber(model.latency_first_chunk_s, leaderboardMetricForId("latency"))}</b><small>FIRST CHUNK</small></span>
      <span class="leaderboard-track-value ${activeMetric.id === "response" ? "is-primary" : ""}"><b>${formatAnalysisNumber(model.total_response_s, leaderboardMetricForId("response"))}</b><small>RESPONSE</small></span>
    </a>`;
  }).join("");

  dom.modelRankBoard.dataset.metric = activeMetric.id;
  const metricTabs = AA_LEADERBOARD_METRICS.map((metric) => `<button type="button" class="leaderboard-metric-tab ${state.leaderboardMetric === metric.id ? "is-active" : ""}" data-leaderboard-metric="${metric.id}" aria-pressed="${state.leaderboardMetric === metric.id}">${escapeHTML(localizedText(metric.label))}</button>`).join("");
  const evidenceMarkup = leaderboardEvidenceMarkup({
    source: "Artificial Analysis",
    capturedAt: state.artificialAnalysis?.last_verified || state.artificialAnalysis?.captured_at,
    rows: ranked.length,
    coverageLabel: state.currentLang === "zh" ? "覆盖" : "Coverage",
    coverageValue: `${ranked.length} ${state.currentLang === "zh" ? "个模型" : "models"}`,
  });
  dom.modelRankBoard.innerHTML = `<div class="leaderboard-board-head"><div><h3>${localizedText(activeMetric.note)}</h3></div></div>${evidenceMarkup}<div class="leaderboard-metric-tabs" aria-label="通用推理指标">${metricTabs}</div><div class="leaderboard-track-legend"><span>${state.currentLang === "zh" ? "排名" : "Rank"}</span><span>${state.currentLang === "zh" ? "模型 / 提供方" : "Model / creator"}</span><span>${state.currentLang === "zh" ? "上下文" : "Context"}</span><span>${state.currentLang === "zh" ? "智能指数" : "Index"}</span><span>${state.currentLang === "zh" ? "成本 / 任务" : "Cost / task"}</span><span>${state.currentLang === "zh" ? "速度" : "Speed"}</span><span>${state.currentLang === "zh" ? "首字延迟" : "First chunk"}</span><span>${state.currentLang === "zh" ? "总响应" : "Response"}</span></div><div class="leaderboard-track">${trackMarkup}</div>`;
  applyLeaderboardLogoFallbacks();
}

function renderArenaLeaderboard(category, leaderboardId = activeArenaLeaderboardId(category)) {
  const leaderboard = arenaLeaderboardForId(leaderboardId);
  const rows = arenaLeaderboardRows(leaderboardId);
  if (!leaderboard || !rows.length) {
    dom.modelRankBoard.innerHTML = `<div class="leaderboard-empty">${state.currentLang === "zh" ? "Arena 榜单快照暂时没有可用数据。" : "The Arena leaderboard snapshot has no usable data yet."}</div>`;
    return;
  }

  const highestScore = Math.max(...rows.map((row) => Number(row.score) || 0));
  const lowestScore = Math.min(...rows.map((row) => Number(row.score) || 0));
  const scoreRange = Math.max(1, highestScore - lowestScore);
  const maxConfidence = Math.max(...rows.map((row) => Number(String(row.confidence || "").match(/\d+(?:\.\d+)?/)?.[0]) || 0), 1);
  const trackMarkup = rows.map((row) => {
    const rank = row.rank;
    const logo = analysisCreatorLogo(row);
    const creatorName = analysisCreatorDisplayName(row);
    const accent = analysisCreatorAccent(row.creator);
    const scoreWidth = leaderboardId === "agent"
      ? Math.max(18, Math.round((Number(row.score) / highestScore) * 100))
      : Math.max(18, Math.round(((Number(row.score) - lowestScore) / scoreRange) * 100));
    const confidence = Number(String(row.confidence || "").match(/\d+(?:\.\d+)?/)?.[0]) || 0;
    const confidenceWidth = Math.max(10, Math.round((confidence / maxConfidence) * 100));
    return `<a class="leaderboard-track-row leaderboard-arena-row ${rank <= 3 ? `leaderboard-track-row-top leaderboard-track-row-${rank}` : ""}" href="${escapeHTML(row.modelUrl)}" target="_blank" rel="noreferrer" style="--rank-accent:${accent};--elo-width:${scoreWidth}%;--confidence-width:${confidenceWidth}%">
      <span class="leaderboard-track-rank">${String(rank).padStart(2, "0")}</span>
      <span class="leaderboard-track-model"><span class="leaderboard-track-logo">${logo ? `<img src="${logo}" alt="${escapeHTML(creatorName)}" loading="lazy" data-logo-fallback>` : providerFallbackMarkup()}<i></i></span><span class="leaderboard-track-copy"><small>${escapeHTML(creatorName)}</small><strong>${escapeHTML(row.name)}</strong></span></span>
      <span class="leaderboard-arena-score"><b>${escapeHTML(String(row.score))}${leaderboard.valueUnit || ""}</b><span><i></i></span></span>
      <span class="leaderboard-arena-confidence"><b>${escapeHTML(row.confidence || "—")}</b><span><i></i></span></span>
      <span class="leaderboard-arena-source">Arena</span>
    </a>`;
  }).join("");

  dom.modelRankBoard.dataset.metric = leaderboardId;
  dom.modelRankBoard.innerHTML = `<div class="leaderboard-board-head"><div><h3>${escapeHTML(localizedText(leaderboard.title))}</h3></div><a class="leaderboard-source-link" href="${escapeHTML(leaderboard.sourceUrl)}" target="_blank" rel="noreferrer" aria-label="打开 Arena 榜单">↗</a></div>${leaderboardEvidenceMarkup({ source: "Arena", capturedAt: ARENA_SNAPSHOT_DATE, rows: rows.length })}<div class="leaderboard-track-legend leaderboard-arena-legend"><span>${state.currentLang === "zh" ? "排名" : "Rank"}</span><span>${state.currentLang === "zh" ? "模型 / 提供方" : "Model / creator"}</span><span>${escapeHTML(localizedText(leaderboard.valueLabel))}</span><span>${state.currentLang === "zh" ? "置信范围" : "Confidence"}</span><span>${state.currentLang === "zh" ? "数据源" : "Source"}</span></div><div class="leaderboard-track leaderboard-arena-track">${trackMarkup}</div>`;
  applyLeaderboardLogoFallbacks();
}

function renderProviderPerformance(category) {
  const providers = providerPerformanceForCategory(category);
  if (!providers.length) {
    dom.modelRankBoard.innerHTML = `<div class="leaderboard-empty">${state.currentLang === "zh" ? "当前任务没有可用的厂商表现数据。" : "No provider performance data is available for this task."}</div>`;
    return;
  }

  const datasets = leaderboardDatasetsForCategory(category);
  const source = [...new Set(datasets.map((dataset) => dataset.source))].join(" / ");
  const capturedAt = datasets.map((dataset) => dataset.capturedAt).filter(Boolean).sort()[0];
  const coverage = datasets.reduce((sum, dataset) => sum + dataset.rows.length, 0);
  const cards = providers.map((provider) => {
    const logo = analysisCreatorLogo({ creator: provider.creator, name: "" });
    const creatorName = analysisCreatorDisplayName({ creator: provider.creator, name: "" });
    const accent = analysisCreatorAccent(provider.creator);
    const leading = provider.appearances.slice(0, 3);
    const best = leading[0];
    const taskMarkup = leading.map((appearance) => `<span class="leaderboard-provider-task"><small>${escapeHTML(appearance.label)}</small><b>#${String(appearance.rank).padStart(2, "0")}</b><strong>${escapeHTML(appearance.name)}</strong></span>`).join("");
    return `<a class="leaderboard-provider-card" href="${escapeHTML(best.sourceUrl)}" target="_blank" rel="noreferrer" style="--rank-accent:${accent}">
      <header><span class="leaderboard-track-logo">${logo ? `<img src="${logo}" alt="${escapeHTML(creatorName)}" loading="lazy" data-logo-fallback>` : providerFallbackMarkup()}<i></i></span><span><small>${state.currentLang === "zh" ? "进入 Top 10" : "Top 10 entries"}</small><b>${provider.appearances.length}</b></span></header>
      <div><h4>${escapeHTML(creatorName)}</h4><p>${state.currentLang === "zh" ? `最佳名次 #${String(provider.bestRank).padStart(2, "0")}` : `Best rank #${String(provider.bestRank).padStart(2, "0")}`}</p></div>
      <footer>${taskMarkup}</footer>
    </a>`;
  }).join("");

  const title = category.id === "overview"
    ? (state.currentLang === "zh" ? "厂商在不同任务中的最佳表现" : "Where each provider performs best")
    : `${localizedText(category.label)} · ${state.currentLang === "zh" ? "厂商表现" : "Provider performance"}`;
  dom.modelRankBoard.dataset.metric = `${category.id}-providers`;
  dom.modelRankBoard.innerHTML = `<div class="leaderboard-board-head"><div><h3>${escapeHTML(title)}</h3></div></div>${leaderboardEvidenceMarkup({ source, capturedAt, rows: coverage, coverageLabel: state.currentLang === "zh" ? "排行记录" : "Ranked entries", coverageValue: `${coverage} ${state.currentLang === "zh" ? "条" : "entries"}` })}<div class="leaderboard-provider-grid">${cards}</div>`;
  applyLeaderboardLogoFallbacks();
}

function renderOverviewCard(categoryId) {
  const category = modelLeaderboardCategoryForId(categoryId);
  const overviewLeaderboardId = category.defaultLeaderboard || category.id;
  const arena = arenaLeaderboardForId(overviewLeaderboardId);
  const media = mediaLeaderboardForId(categoryId);
  const rows = arena
    ? arenaLeaderboardRows(overviewLeaderboardId).slice(0, 5)
    : (media?.models || []).slice(0, 5).map((model) => ({
      rank: model.rank,
      creator: model.creator,
      name: model.name,
      score: model.elo,
      scoreLabel: model.elo_display,
      confidence: mediaConfidenceLabel(model),
      modelUrl: media.source_url,
      released: model.released,
    }));
  if (!rows.length) return "";

  const scores = rows.map((row) => Number(row.score) || 0);
  const maxScore = Math.max(...scores, 1);
  const minScore = Math.min(...scores);
  const range = Math.max(1, maxScore - minScore);
  const sourceName = arena ? "Arena" : "Artificial Analysis";
  const title = arena ? localizedText(arena.title) : localizedText(media.title);
  const valueUnit = arena?.valueUnit || "";
  const rowsMarkup = rows.map((row) => {
    const logo = analysisCreatorLogo(row);
    const creatorName = analysisCreatorDisplayName(row);
    const accent = analysisCreatorAccent(row.creator);
    const width = overviewLeaderboardId === "agent"
      ? Math.max(16, Math.round((Number(row.score) / maxScore) * 100))
      : Math.max(16, Math.round(((Number(row.score) - minScore) / range) * 100));
    return `<a class="leaderboard-mini-row" href="${escapeHTML(row.modelUrl)}" target="_blank" rel="noreferrer" style="--rank-accent:${accent};--elo-width:${width}%">
      <span class="leaderboard-mini-rank">${String(row.rank).padStart(2, "0")}</span>
      <span class="leaderboard-mini-logo">${logo ? `<img src="${logo}" alt="${escapeHTML(creatorName)}" loading="lazy" data-logo-fallback>` : providerFallbackMarkup()}</span>
      <span class="leaderboard-mini-copy"><small>${escapeHTML(creatorName)}</small><strong>${escapeHTML(row.name)}</strong></span>
      <span class="leaderboard-mini-score"><b>${escapeHTML(String(row.scoreLabel ?? row.score))}${valueUnit}</b><span><i></i></span><small>${escapeHTML(row.confidence || "")}</small></span>
    </a>`;
  }).join("");

  return `<article class="leaderboard-overview-card leaderboard-overview-card-${categoryId}">
    <header class="leaderboard-overview-card-head"><div><span class="leaderboard-card-kicker">${escapeHTML(localizedText(category.label))}</span><h4>${escapeHTML(title)}</h4></div><a class="leaderboard-source-link" href="${escapeHTML(arena?.sourceUrl || media?.source_url || "#")}" target="_blank" rel="noreferrer" aria-label="打开 ${escapeHTML(sourceName)} 榜单">↗</a></header>
    ${leaderboardEvidenceMarkup({ source: sourceName, capturedAt: arena ? ARENA_SNAPSHOT_DATE : state.mediaModelLeaderboards?.captured_at, rows: rows.length, independent: false })}
    <div class="leaderboard-mini-list">${rowsMarkup}</div>
  </article>`;
}

function renderOverviewLeaderboard() {
  const cards = ["agent", "text", "code", "image", "video", "music"].map(renderOverviewCard).join("");
  dom.modelRankBoard.dataset.metric = "overview";
  dom.modelRankBoard.innerHTML = `<div class="leaderboard-board-head"><div><h3>${state.currentLang === "zh" ? "按任务类型看模型" : "Models by task"}</h3></div></div><div class="leaderboard-overview-grid">${cards}</div>`;
  applyLeaderboardLogoFallbacks();
}

function mediaConfidenceLabel(model) {
  const bounds = model.confidence_bounds;
  if (state.currentLang === "zh" && bounds && model.confidence_interval?.includes("95%")) {
    return `±${bounds.delta}（95%区间 ${Math.round(bounds.lower)}–${Math.round(bounds.upper)}）`;
  }
  return model.confidence_interval || "—";
}

function renderMediaLeaderboard(category) {
  const leaderboard = mediaLeaderboardForId(category.id);
  if (!leaderboard?.models?.length) {
    dom.modelRankBoard.innerHTML = `<div class="leaderboard-empty">${state.currentLang === "zh" ? "该生成模型榜单快照暂时没有可用数据。" : "This generative model leaderboard has no usable snapshot yet."}</div>`;
    return;
  }

  const rows = leaderboard.models;
  const lowestElo = Math.min(...rows.map((model) => Number(model.elo) || 0));
  const highestElo = Math.max(...rows.map((model) => Number(model.elo) || 1));
  const eloRange = Math.max(1, highestElo - lowestElo);
  const trackMarkup = rows.map((model) => {
    const logo = analysisCreatorLogo(model);
    const creatorName = analysisCreatorDisplayName(model);
    const scoreWidth = Math.max(16, Math.round(((Number(model.elo) - lowestElo) / eloRange) * 100));
    const accent = analysisCreatorAccent(model.creator);
    return `<a class="leaderboard-track-row leaderboard-media-row" href="${escapeHTML(leaderboard.source_url)}" target="_blank" rel="noreferrer" style="--rank-accent:${accent};--elo-width:${scoreWidth}%">
      <span class="leaderboard-track-rank">${String(model.rank).padStart(2, "0")}</span>
      <span class="leaderboard-track-model"><span class="leaderboard-track-logo">${logo ? `<img src="${logo}" alt="${escapeHTML(creatorName)}" loading="lazy" data-logo-fallback>` : providerFallbackMarkup()}<i></i></span><span class="leaderboard-track-copy"><small>${escapeHTML(creatorName)}</small><strong>${escapeHTML(model.name)}</strong></span></span>
      <span class="leaderboard-media-score"><b>${escapeHTML(String(model.elo_display ?? model.elo))}</b><span><i></i></span></span>
      <span class="leaderboard-media-evidence"><b>${escapeHTML(mediaConfidenceLabel(model))}</b><small>${formatCount(Number(model.samples) || 0)} ${state.currentLang === "zh" ? "样本" : "samples"}</small></span>
      <span class="leaderboard-media-release">${escapeHTML(model.released || "—")}</span>
      <span class="leaderboard-media-price">${escapeHTML(model.price || "—")}</span>
    </a>`;
  }).join("");

  dom.modelRankBoard.dataset.metric = category.id;
  const releaseMarkup = Array.isArray(leaderboard.new_releases) && leaderboard.new_releases.length
    ? `<div class="leaderboard-media-new-releases">${leaderboard.new_releases.map((release) => `<a class="leaderboard-media-new-release" href="${escapeHTML(release.source_url)}" target="_blank" rel="noreferrer"><span class="leaderboard-media-new-badge">NEW</span><span><strong>${escapeHTML(release.name)}</strong><small>${escapeHTML(release.creator)} · ${escapeHTML(release.status)}</small></span><span class="leaderboard-media-new-arrow">↗</span></a>`).join("")}</div>`
    : "";
  const coverageValue = leaderboard.variant_label
    ? localizedText(leaderboard.variant_label)
    : `${rows.length} ${state.currentLang === "zh" ? "个模型" : "models"}`;
  const evidenceMarkup = leaderboardEvidenceMarkup({
    source: "Artificial Analysis",
    capturedAt: state.mediaModelLeaderboards?.last_verified || state.mediaModelLeaderboards?.captured_at,
    rows: rows.length,
    coverageLabel: state.currentLang === "zh" ? "榜单变体" : "Variant",
    coverageValue,
  });
  dom.modelRankBoard.innerHTML = `<div class="leaderboard-board-head"><div><h3>${escapeHTML(localizedText(leaderboard.title))}</h3></div></div>${evidenceMarkup}${releaseMarkup}<div class="leaderboard-track-legend leaderboard-media-legend"><span>${state.currentLang === "zh" ? "排名" : "Rank"}</span><span>${state.currentLang === "zh" ? "模型 / 提供方" : "Model / creator"}</span><span>Elo</span><span>${state.currentLang === "zh" ? "置信 / 样本" : "Confidence / samples"}</span><span>${state.currentLang === "zh" ? "发布时间" : "Released"}</span><span>${state.currentLang === "zh" ? "API 价格" : "API price"}</span></div><div class="leaderboard-track leaderboard-media-track">${trackMarkup}</div>`;
  applyLeaderboardLogoFallbacks();
}

const BRIEF_TABS = [
  { id: "llm", label: "语言模型" },
  { id: "image", label: "图像生成" },
  { id: "video", label: "视频生成" },
];

function briefScore(value) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function briefRowsMarkup(board, kind, sourceId, limit = 10) {
  const rows = (board?.rows || []).slice(0, limit);
  const scores = rows.map((row) => Number(row.score) || 0);
  const max = Math.max(...scores, 1);
  const min = Math.min(...scores, max);
  const range = Math.max(1, max - min);
  return rows.map((row, index) => {
    const logo = analysisCreatorLogo({ creator: row.creator, name: row.name });
    const width = Math.max(14, Math.round(((Number(row.score) - min) / range) * 86) + 14);
    let side = "";
    if (kind === "llm" && sourceId === "aa") {
      side = `<small>${row.cost == null ? "—" : `$${row.cost}`}<em>/任务</em></small>`;
    } else if (kind === "llm") {
      side = `<small>${escapeHTML(row.ci || "")}${row.flag ? `<em>${escapeHTML(row.flag)}</em>` : ""}</small>`;
    } else if (sourceId === "aa") {
      side = `<small>${escapeHTML(row.extra || "—")}</small>`;
    } else {
      side = `<small>${row.extra ? `<em>${escapeHTML(row.extra)}</em>` : ""}</small>`;
    }
    return `<li class="brief-row${index < 3 ? " is-top" : ""}" style="--bar:${width}%">
      <span class="brief-rank">${String(index + 1).padStart(2, "0")}</span>
      <span class="brief-logo">${logo ? `<img src="${logo}" alt="" loading="lazy" data-logo-fallback>` : providerFallbackMarkup()}</span>
      <span class="brief-name"><strong>${escapeHTML(row.name)}</strong><small>${escapeHTML(row.creator || "")}</small></span>
      <span class="brief-score"><b>${escapeHTML(briefScore(row.score))}</b>${side}<i></i></span>
    </li>`;
  }).join("");
}

function briefBoardMarkup(board, kind, sourceId, limit = 10) {
  if (!board) return "";
  const sourceName = sourceId === "aa" ? "Artificial Analysis" : "Arena";
  const scoreLabel = kind === "llm" && sourceId === "aa" ? "智能指数" : "Elo";
  return `<article class="brief-board" data-source="${sourceId}">
    <header><div><span class="brief-kicker">${sourceName}</span><h3>${escapeHTML(board.title)}</h3><p>${escapeHTML(board.meta || "")}</p></div><a class="brief-source" href="${escapeHTML(board.url)}" target="_blank" rel="noreferrer">原榜单 ↗</a></header>
    <div class="brief-legend"><span>排名</span><span>模型</span><span>${scoreLabel}</span></div>
    <ol class="brief-list">${briefRowsMarkup(board, kind, sourceId, limit)}</ol>
    ${board.note && limit >= 10 ? `<p class="brief-note">${escapeHTML(board.note)}</p>` : ""}
  </article>`;
}

function renderLeaderboardBrief() {
  const brief = state.leaderboardBrief;
  const tab = BRIEF_TABS.some((item) => item.id === state.leaderboardBriefTab) ? state.leaderboardBriefTab : "llm";
  const group = brief[tab] || {};
  dom.modelRankView.innerHTML = `<span class="brief-updated">数据更新 ${escapeHTML(brief.updated_at || "")}</span><a class="brief-guide-link" href="${escapeHTML(brief.guide_url)}" target="_blank" rel="noreferrer">AI 选型指南 ↗</a>`;
  dom.modelRankTabs.innerHTML = BRIEF_TABS.map((item) => `<button type="button" class="leaderboard-tab${item.id === tab ? " is-active" : ""}" role="tab" aria-selected="${item.id === tab}" data-brief-tab="${item.id}"><strong>${item.label}</strong></button>`).join("");
  dom.modelRankSubtabs.hidden = true;
  dom.modelRankSubtabs.replaceChildren();
  const picks = (brief.picks || []).map((pick) => `<article class="brief-pick"><header><span aria-hidden="true">${escapeHTML(pick.icon || "")}</span><h4>${escapeHTML(pick.label)}</h4></header><p>${escapeHTML(pick.text)}</p>${pick.models?.length ? `<div>${pick.models.map((model) => `<span>${escapeHTML(model)}</span>`).join("")}</div>` : ""}</article>`).join("");
  dom.modelRankBoard.dataset.metric = `brief-${tab}`;
  dom.modelRankBoard.innerHTML = `
    <p class="brief-intro">两家榜单评委和题目不同：Artificial Analysis 是机构统一跑分，看硬实力和性价比；Arena 是真人匿名盲投，看用起来顺不顺手。比排名，别比分数。</p>
    <div class="brief-grid">${briefBoardMarkup(group.aa, tab, "aa")}${briefBoardMarkup(group.arena, tab, "arena")}</div>
    <section class="brief-picks" aria-labelledby="briefPicksTitle"><header><h3 id="briefPicksTitle">我该用哪个</h3><p>按用途直接给结论，细节去选型指南里对比。</p></header><div class="brief-pick-grid">${picks}</div></section>
    <a class="brief-cta" href="${escapeHTML(brief.guide_url)}" target="_blank" rel="noreferrer"><span><small>深度对比</small><strong>22 个主流模型的价格、速度、上下文、多模态并排对比</strong></span><b>打开 AI 选型指南 ↗</b></a>`;
  applyLeaderboardLogoFallbacks();
}

function renderLabBoard() {
  const board = document.getElementById("labBoard");
  const list = document.getElementById("labBoardList");
  if (!board || !list) return;
  board.hidden = state.currentView !== "lab";
  if (board.hidden) return;
  const entries = [...(state.labExperiments || [])].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  if (!entries.length) {
    list.innerHTML = `<div class="lab-empty"><strong>还没有实验</strong><p>在仓库根目录的 lab-experiments.json 里加一条就会出现在这里，或者直接把链接发给 Hark。</p><code>{ "title": "名字", "summary": "一句话说明", "url": "https://…", "date": "2026-10-17", "status": "进行中", "tags": ["vibe coding"] }</code></div>`;
    return;
  }
  list.innerHTML = entries.map((entry) => {
    const title = localizedText(entry.title, "");
    const summary = localizedText(entry.summary, "");
    const tags = (entry.tags || []).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
    const cover = entry.cover ? `<img src="${escapeHTML(entry.cover)}" alt="" loading="lazy">` : "";
    const tag = entry.url ? "a" : "article";
    const href = entry.url ? ` href="${escapeHTML(entry.url)}" target="_blank" rel="noreferrer"` : "";
    return `<${tag} class="lab-card"${href}>${cover}<div><header><small>${escapeHTML(entry.date || "")}${entry.status ? ` · ${escapeHTML(entry.status)}` : ""}</small><h3>${escapeHTML(title)}</h3></header>${summary ? `<p>${escapeHTML(summary)}</p>` : ""}${tags ? `<footer>${tags}</footer>` : ""}</div>${entry.url ? "<b>↗</b>" : ""}</${tag}>`;
  }).join("");
}

function renderLeaderboard() {
  renderLabBoard();
  if (!dom.modelLeaderboard || !dom.modelRankView || !dom.modelRankTabs || !dom.modelRankSubtabs || !dom.modelRankBoard) return;
  const isModels = state.currentView === "models";
  dom.modelLeaderboard.hidden = !isModels;
  if (!isModels) return;
  if (state.leaderboardBrief) {
    renderLeaderboardBrief();
    return;
  }

  const activeCategory = modelLeaderboardCategoryForId(state.modelLeaderboardCategory);
  dom.modelRankView.replaceChildren();
  for (const view of [
    { id: "models", label: { zh: "模型排行", en: "Models" } },
    { id: "providers", label: { zh: "厂商表现", en: "Labs" } },
  ]) {
    const button = createElement("button", "leaderboard-view-tab");
    button.type = "button";
    button.dataset.modelLeaderboardView = view.id;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(state.modelLeaderboardView === view.id));
    button.classList.toggle("is-active", state.modelLeaderboardView === view.id);
    button.textContent = localizedText(view.label);
    dom.modelRankView.append(button);
  }
  dom.modelRankTabs.replaceChildren();
  for (const category of MODEL_LEADERBOARD_CATEGORIES) {
    const button = createElement("button", "leaderboard-tab");
    button.type = "button";
    button.dataset.modelLeaderboardCategory = category.id;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(state.modelLeaderboardCategory === category.id));
    button.classList.toggle("is-active", state.modelLeaderboardCategory === category.id);
    button.append(createElement("strong", "", localizedText(category.label)));
    dom.modelRankTabs.append(button);
  }

  const subcategories = leaderboardSubcategoriesForCategory(activeCategory);
  dom.modelRankSubtabs.hidden = !subcategories.length;
  dom.modelRankSubtabs.replaceChildren();
  if (subcategories.length) {
    const selectedSubcategory = activeLeaderboardSubcategory(activeCategory);
    for (const subcategory of subcategories) {
      const button = createElement("button", "leaderboard-subtab");
      button.type = "button";
      button.dataset.modelLeaderboardSubcategory = subcategory.id;
      button.dataset.modelLeaderboardParent = activeCategory.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(selectedSubcategory?.id === subcategory.id));
      button.classList.toggle("is-active", selectedSubcategory?.id === subcategory.id);
      button.textContent = localizedText(subcategory.label);
      dom.modelRankSubtabs.append(button);
    }
  }

  if (state.modelLeaderboardView === "providers") renderProviderPerformance(activeCategory);
  else if (activeCategory.id === "overview") renderOverviewLeaderboard();
  else if (activeCategory.kind === "arena") renderArenaLeaderboard(activeCategory, activeArenaLeaderboardId(activeCategory));
  else if (activeCategory.kind === "media") renderMediaLeaderboard(activeCategory);
  else if (activeCategory.kind === "general") renderGeneralLeaderboard();
  else renderGeneralLeaderboard();
}

function renderHomeLeaderboard() {
  if (!dom.homeLeaderboard || !dom.homeLeaderboardTabs || !dom.homeLeaderboardBoard) return;
  const isHome = state.currentView === "home";
  dom.homeLeaderboard.hidden = !isHome;
  if (!isHome) return;
  if (state.leaderboardBrief) {
    const brief = state.leaderboardBrief;
    const tab = BRIEF_TABS.some((item) => item.id === state.homeBriefTab) ? state.homeBriefTab : "llm";
    const group = brief[tab] || {};
    dom.homeLeaderboardTabs.innerHTML = BRIEF_TABS.map((item) => `<button type="button" class="leaderboard-tab${item.id === tab ? " is-active" : ""}" role="tab" aria-selected="${item.id === tab}" data-home-brief-tab="${item.id}"><strong>${item.label}</strong></button>`).join("");
    dom.homeLeaderboardBoard.dataset.metric = `brief-${tab}`;
    dom.homeLeaderboardBoard.innerHTML = `<div class="brief-grid is-compact">${briefBoardMarkup(group.aa, tab, "aa", 5)}${briefBoardMarkup(group.arena, tab, "arena", 5)}</div><p class="brief-home-foot"><span>数据更新 ${escapeHTML(brief.updated_at || "")} · 每周一自动刷新</span><button type="button" class="text-button" data-view-target="models">看前 10 和「我该用哪个」→</button></p>`;
    applyLeaderboardLogoFallbacks(dom.homeLeaderboardBoard);
    return;
  }

  const categories = HOME_LEADERBOARD_CATEGORY_IDS
    .map(modelLeaderboardCategoryForId)
    .filter(Boolean);
  const activeCategory = categories.find((category) => category.id === state.homeLeaderboardMetric) || categories[0];

  dom.homeLeaderboardTabs.replaceChildren();
  for (const category of categories) {
    const button = createElement("button", "leaderboard-tab");
    button.type = "button";
    button.dataset.homeLeaderboardCategory = category.id;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(activeCategory.id === category.id));
    button.classList.toggle("is-active", activeCategory.id === category.id);
    button.append(createElement("strong", "", localizedText(category.label)));
    dom.homeLeaderboardTabs.append(button);
  }

  let title = "";
  let sourceUrl = "";
  let sourceName = "";
  let valueLabel = "";
  let valueUnit = "";
  let capturedAt = ARENA_SNAPSHOT_DATE;
  let rows = [];
  if (activeCategory.kind === "arena") {
    const leaderboardId = activeArenaLeaderboardId(activeCategory);
    const leaderboard = arenaLeaderboardForId(leaderboardId);
    if (!leaderboard) return;
    title = localizedText(leaderboard.title);
    sourceUrl = leaderboard.sourceUrl;
    sourceName = "Arena";
    valueLabel = localizedText(leaderboard.valueLabel);
    valueUnit = leaderboard.valueUnit || "";
    rows = arenaLeaderboardRows(leaderboardId).slice(0, 5);
  } else {
    const leaderboard = mediaLeaderboardForId(activeCategory.id);
    if (!leaderboard?.models?.length) return;
    title = localizedText(leaderboard.title);
    sourceUrl = leaderboard.source_url;
    sourceName = "Artificial Analysis";
    capturedAt = state.mediaModelLeaderboards?.captured_at;
    valueLabel = "Elo";
    rows = leaderboard.models.slice(0, 5).map((model) => ({
      rank: model.rank,
      creator: model.creator,
      name: model.name,
      score: model.elo,
      scoreLabel: model.elo_display,
      confidence: mediaConfidenceLabel(model),
    }));
  }

  const rowsMarkup = rows.map((row) => {
    const logo = analysisCreatorLogo(row);
    const creatorName = analysisCreatorDisplayName(row);
    const accent = analysisCreatorAccent(row.creator);
    return `<a class="leaderboard-home-row" href="${escapeHTML(sourceUrl)}" target="_blank" rel="noreferrer" style="--rank-accent:${accent}">
      <span class="leaderboard-track-rank">${String(row.rank).padStart(2, "0")}</span>
      <span class="leaderboard-track-model"><span class="leaderboard-track-logo">${logo ? `<img src="${logo}" alt="${escapeHTML(creatorName)}" loading="lazy" data-logo-fallback>` : providerFallbackMarkup()}<i></i></span><span class="leaderboard-track-copy"><small>${escapeHTML(creatorName)}</small><strong>${escapeHTML(row.name)}</strong></span></span>
      <span class="leaderboard-home-score"><b>${escapeHTML(String(row.scoreLabel ?? row.score))}${valueUnit}</b><small>${escapeHTML(valueLabel)}</small></span>
      <span class="leaderboard-home-confidence"><b>${escapeHTML(row.confidence || "—")}</b><small>${state.currentLang === "zh" ? "置信范围" : "Confidence"}</small></span>
    </a>`;
  }).join("");

  dom.homeLeaderboardBoard.dataset.metric = activeCategory.id;
  dom.homeLeaderboardBoard.innerHTML = `<div class="leaderboard-board-head"><div><h3>${escapeHTML(title)}</h3></div><a class="leaderboard-source-link" href="${escapeHTML(sourceUrl)}" target="_blank" rel="noreferrer" aria-label="打开 ${escapeHTML(sourceName)} 榜单">↗</a></div>${leaderboardEvidenceMarkup({ source: sourceName, capturedAt, rows: rows.length, independent: false })}<div class="leaderboard-home-list">${rowsMarkup}</div>`;
  applyLeaderboardLogoFallbacks(dom.homeLeaderboardBoard);
}

function promptActionIdsForItem(item) {
  const text = [
    item.id,
    localizedText(item.title, "", "zh"),
    localizedText(item.title, "", "en"),
    localizedText(item.summary, "", "zh"),
    localizedText(item.summary, "", "en"),
  ].join(" ");
  const matches = PROMPT_ACTIONS
    .filter((action) => action.pattern?.test(text))
    .map((action) => action.id);
  return matches.length ? matches : ["direct"];
}

function primaryFiltersForView(view) {
  if (view === "knowledge") {
    return KNOWLEDGE_TYPES.map((type) => ({ ...type, mode: `knowledge-type:${type.id}` }));
  }
  if (view === "models") {
    return MODEL_TYPE_GROUPS.map((group) => ({ ...group, mode: `type:${group.id}` }));
  }
  if (view === "agents") {
    return AGENT_RESOURCE_TYPES.map((type) => ({ ...type, mode: `resource:${type.id}` }));
  }
  if (view === "prompts") {
    return PROMPT_CATEGORIES.map((category) => ({ ...category, mode: `category:${category.id}`, category }));
  }
  return [];
}

function secondaryFiltersForView(view) {
  if (view === "knowledge") {
    return KNOWLEDGE_DOMAINS.map((domain) => ({ ...domain, mode: `knowledge-domain:${domain.id}` }));
  }
  if (view === "models") {
    return MODEL_COMPANIES.map((company) => ({ ...company, mode: `company:${company.id}`, company }));
  }
  if (view === "agents") {
    return AGENT_CATEGORIES.map((category) => ({ ...category, mode: `category:${category.id}`, category }));
  }
  if (view === "aitools") {
    return TOOL_CATEGORIES.map((category) => ({ ...category, mode: `tool-category:${category.id}` }));
  }
  return [];
}

function itemMatchesMode(item, mode) {
  if (!mode || mode === "all") return true;
  if (mode === "saved") return state.favorites.has(item.id);
  if (SURFACE_ORDER.includes(mode)) return item._surfaces?.includes(mode);
  if (mode.startsWith("company:")) return item.company === mode.slice("company:".length);
  if (mode.startsWith("type:")) return item._modelTypeGroupIds?.includes(mode.slice("type:".length));
  if (mode.startsWith("resource:")) return item._resourceType === mode.slice("resource:".length);
  if (mode.startsWith("category:")) return item._categoryIds?.includes(mode.slice("category:".length));
  if (mode.startsWith("action:")) return item._promptActionIds?.includes(mode.slice("action:".length));
  if (mode.startsWith("knowledge-type:")) return item._knowledgeType === mode.slice("knowledge-type:".length);
  if (mode.startsWith("knowledge-domain:")) return item._knowledgeDomainIds?.includes(mode.slice("knowledge-domain:".length));
  if (mode.startsWith("tool-category:")) return item.toolCategory === mode.slice("tool-category:".length);
  return false;
}

function categoryLabelsForItem(item, language = state.currentLang, priorityCategoryId = "") {
  if (item._surface === "knowledge") {
    const type = KNOWLEDGE_TYPES.find((candidate) => candidate.id === item._knowledgeType);
    const level = KNOWLEDGE_LEVELS.find((candidate) => candidate.id === item.level);
    return [type, level].filter(Boolean).map((entry) => localizedText(entry.label, "", language));
  }
  const definitions = categoryDefinitionsForView(item._surface);
  const categoryIds = [...(item._categoryIds || [])];
  const priorityIndex = categoryIds.indexOf(priorityCategoryId);
  if (priorityIndex > 0) {
    categoryIds.unshift(...categoryIds.splice(priorityIndex, 1));
  }
  return categoryIds
    .map((categoryId) => definitions.find((category) => category.id === categoryId))
    .filter(Boolean)
    .map((category) => localizedText(category.label, "", language));
}

function promptDisplayLabelsForItem(item, language = state.currentLang) {
  const tags = localized(item.tags, [], "zh");
  const values = Array.isArray(tags) ? tags : [tags];
  const seen = new Set();
  return values
    .map((tag) => PROMPT_CATEGORIES.find((category) => category.tag === tag))
    .filter(Boolean)
    .map((category) => localizedText(category.label, "", language))
    .filter((label) => {
      if (seen.has(label)) return false;
      seen.add(label);
      return true;
    });
}

function effectiveSurfaceForItem(item) {
  if (state.currentView !== "home" && item._surfaces?.includes(state.currentView)) return state.currentView;
  return item._surface;
}

function prepareItems(rawItems) {
  const byId = new Map();
  for (const rawItem of Array.isArray(rawItems) ? rawItems : []) {
    if (!rawItem || !rawItem.id || rawItem.status === "archived" || byId.has(rawItem.id)) continue;
    const item = { ...rawItem };
    item._surface = surfaceForItem(item);
    item._surfaces = surfacesForItem(item);
    item._categoryIds = categoryIdsForItem(item, item._surface);
    item._modelTypeGroupIds = item._surface === "models" ? modelTypeIdsForItem(item) : [];
    item._resourceType = item._surface === "agents" ? (item.category === "MCP" ? "mcp" : "skill") : "";
    item._promptActionIds = item._surface === "prompts" ? promptActionIdsForItem(item) : [];
    item._knowledgeType = item._surface === "knowledge" ? item.knowledgeType || "reference" : "";
    item._knowledgeDomainIds = item._surface === "knowledge"
      ? (Array.isArray(item.knowledgeDomains) ? item.knowledgeDomains : [item.knowledgeDomain].filter(Boolean))
      : [];
    const categorySearchText = [
      ...categoryLabelsForItem(item, "zh"),
      ...categoryLabelsForItem(item, "en"),
    ];
    const searchParts = [
      item.id,
      item.category,
      item.view,
      item.company,
      item.provider,
      item.series,
      item.modelId,
      item.modelType,
      item.contextWindow,
      item.models,
      localizedText(item.title),
      localizedText(item.title, "", "en"),
      localizedText(item.summary),
      localizedText(item.summary, "", "en"),
      localizedText(item.domain),
      localizedText(item.tags, "", "zh"),
      localizedText(item.tags, "", "en"),
      ...categorySearchText,
      ...item._promptActionIds,
      item._knowledgeType,
      ...item._knowledgeDomainIds,
      localizedText(item.aliases, "", "zh"),
      localizedText(item.aliases, "", "en"),
      ...(Array.isArray(item.search_terms) ? item.search_terms : []),
    ];
    item._searchText = normalizeText(searchParts.join(" "));
    byId.set(item.id, item);
  }
  return [...byId.values()];
}

function loadPreferences() {
  const savedLanguage = readStorage(STORAGE_KEYS.language, "zh");
  state.currentLang = savedLanguage === "en" ? "en" : "zh";

  state.favorites = new Set(readWorkspaceIds(STORAGE_KEYS.favorites));
  state.recentItems = readWorkspaceIds(STORAGE_KEYS.recent, 12);

  if (readStorage(STORAGE_KEYS.sidebar) === "true" && window.innerWidth > 980) {
    document.body.classList.add("sidebar-collapsed");
  }
}

function createElement(tag, className, text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createIcon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  // Lucide paths; attribution is in assets/icons/LICENSE.lucide.txt.
  const lucidePaths = {
    check: ["M20 6 9 17l-5-5"],
    x: ["M18 6 6 18", "m6 6 12 12"],
    download: ["M12 15V3", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "m7 10 5 5 5-5"],
    upload: ["M12 3v12", "m17 8-5-5-5 5", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"],
  };
  if (lucidePaths[name]) {
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    for (const d of lucidePaths[name]) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      svg.append(path);
    }
    return svg;
  }
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const paths = {
    arrow: "M3 8h9M8 4l4 4-4 4",
    star: "M8 1.8l1.8 3.7 4.1.6-3 2.9.7 4.1L8 11.2l-3.6 1.9.7-4.1-3-2.9 4.1-.6L8 1.8z",
    copy: "M5 5h8v8H5zM3 11V3h8",
  };
  path.setAttribute("d", paths[name] || paths.arrow);
  svg.append(path);
  return svg;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });
  dom.searchInput.placeholder = SEARCH_PLACEHOLDERS[state.currentView]?.[state.currentLang]
    || SEARCH_PLACEHOLDERS.home[state.currentLang];
  dom.searchInput.setAttribute("aria-label", translate("searchLabel"));
  const searchExpanded = dom.headerSearch.classList.contains("is-open");
  dom.searchToggle.setAttribute("aria-expanded", String(searchExpanded));
  dom.searchToggle.setAttribute("aria-label", searchExpanded ? translate("close") : translate("searchLabel"));
  dom.searchToggle.title = translate("searchLabel");
  const axisLabels = FILTER_AXIS_LABELS[state.currentView] || {
    primary: { zh: translate("moduleFilterLabel"), en: translate("moduleFilterLabel") },
    secondary: { zh: "", en: "" },
  };
  const primaryLabel = localizedText(axisLabels.primary);
  const secondaryLabel = localizedText(axisLabels.secondary);
  dom.primaryFilterLabel.textContent = primaryLabel;
  dom.secondaryFilterLabel.textContent = secondaryLabel;
  dom.modeTabs.setAttribute("aria-label", primaryLabel);
  dom.secondaryTabs.setAttribute("aria-label", secondaryLabel);
  dom.modeTabsPrev.setAttribute("aria-label", translate("scrollTabsLeft"));
  dom.modeTabsPrev.title = translate("scrollTabsLeft");
  dom.modeTabsNext.setAttribute("aria-label", translate("scrollTabsRight"));
  dom.modeTabsNext.title = translate("scrollTabsRight");
  dom.secondaryTabsPrev.setAttribute("aria-label", translate("scrollTabsLeft"));
  dom.secondaryTabsPrev.title = translate("scrollTabsLeft");
  dom.secondaryTabsNext.setAttribute("aria-label", translate("scrollTabsRight"));
  dom.secondaryTabsNext.title = translate("scrollTabsRight");
  dom.clearSearch.setAttribute("aria-label", translate("clearSearch"));
  dom.panelClose.setAttribute("aria-label", translate("close"));
  dom.panelSave.setAttribute("aria-label", state.favorites.has(state.selectedWorkflowId || state.selectedId) ? translate("unfavorite") : translate("favorite"));
  dom.sidebarToggle.setAttribute(
    "aria-label",
    document.body.classList.contains("sidebar-collapsed") ? translate("expandSidebar") : translate("collapseSidebar"),
  );
  dom.langToggle.textContent = state.currentLang === "zh" ? "EN" : "中文";
  dom.langToggle.setAttribute("aria-label", state.currentLang === "zh" ? translate("switchToEnglish") : translate("switchToChinese"));
  document.documentElement.lang = state.currentLang === "zh" ? "zh-CN" : "en";
}

function renderNav() {
  const views = ["home", ...SURFACE_ORDER, ...PERSONAL_VIEWS];
  for (const view of views) {
    const button = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (!button) continue;
    const active = state.currentView === view;
    const label = button.querySelector(".rail-label")?.textContent.trim();
    if (label) {
      button.setAttribute("aria-label", label);
      button.title = label;
    }
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
    const workflowCounts = workflowInventoryCounts();
    const count = view === "home"
      ? state.items.length
      : view === "workflows"
        ? workflowCounts.published + workflowCounts.researching
        : view === "my"
          ? state.favorites.size
          : view === "team"
            ? 0
            : view === "models"
              ? modelInventoryCount()
              : state.items.filter((item) => item._surfaces?.includes(view)).length;
    const countElement = button.querySelector("[data-nav-count]");
    if (countElement) countElement.textContent = compactCount(count);
  }
}

function workflowInventoryCounts() {
  const published = state.workflows.filter((workflow) => workflowEligibleForHome(workflow)).length;
  const researching = state.workflows.filter((workflow) => workflow.verification_status === "researching").length;
  return { published, researching };
}

function modelInventoryCount() {
  const catalogIds = new Set(
    (state.modelCatalog || [])
      .filter((model) => !isExcludedModelRecord(model))
      .map((model) => model.id),
  );
  const legacyOnly = state.items.filter((item) => item._surface === "models" && !catalogIds.has(item.id));
  return catalogIds.size + legacyOnly.length;
}

function renderHeader() {
  const view = VIEWS[state.currentView] || VIEWS.home;
  const items = getViewItems(state.currentView);
  document.body.dataset.view = state.currentView;
  dom.viewEyebrow.textContent = "";
  dom.viewEyebrow.hidden = true;
  dom.viewTitle.textContent = localizedText(view.title);
  dom.viewSubtitle.textContent = localizedText(view.subtitle);
  dom.viewSubtitle.hidden = !dom.viewSubtitle.textContent;
  const activeTask = taskEntryForId(state.activeTaskId);
  if (dom.viewTaskStatus) {
    const activeChannel = taskChannelForId(state.activeTaskId, state.activeTaskChannel);
    const taskMatchesView = activeTask && (activeChannel?.targetView || activeTask.targetView) === state.currentView;
    dom.viewTaskStatus.hidden = !taskMatchesView;
    dom.viewTaskStatus.textContent = taskMatchesView
      ? (state.currentLang === "zh" ? `当前任务：${localizedText(activeTask.label)} · ${activeChannel ? localizedText(activeChannel.label) : "已应用相关筛选"}` : `Task: ${localizedText(activeTask.label, "", "en")} · ${activeChannel ? localizedText(activeChannel.label, "", "en") : "Related filters applied"}`)
      : "";
  }
  if (dom.viewCount) dom.viewCount.textContent = formatCount(items.length);
  const isHome = state.currentView === "home";
  const libraryTitleKey = {
    models: "modelLibraryTitle",
    agents: "agentLibraryTitle",
    workflows: "workflowLibraryTitle",
    lab: "labLibraryTitle",
  }[state.currentView] || (isHome ? "curatedTitle" : "libraryTitle");
  dom.libraryEyebrow.textContent = "";
  dom.libraryEyebrow.hidden = true;
  dom.libraryTitle.textContent = translate(libraryTitleKey);
  const showLibraryHeading = ["home", "models", "agents", "lab"].includes(state.currentView);
  dom.libraryTitle.closest(".library-heading").hidden = !showLibraryHeading;
  dom.libraryTitle.closest(".library").setAttribute("aria-labelledby", showLibraryHeading ? "libraryTitle" : "viewTitle");
  document.title = `${localizedText(view.title)} · 知识宇宙`;
}

function getViewItems(view = state.currentView) {
  if (view === "home") return state.items;
  if (view === "workflows") return state.workflows;
  if (view === "my") return state.items.filter((item) => state.favorites.has(item.id));
  if (view === "team") return [];
  return state.items
    .filter((item) => item._surfaces?.includes(view))
    .sort((left, right) => {
      const dateDelta = String(right.last_verified || right.updated || "").localeCompare(String(left.last_verified || left.updated || ""));
      if (dateDelta !== 0) return dateDelta;
      const leftStructured = String(left.id || "").includes(":") ? 1 : 0;
      const rightStructured = String(right.id || "").includes(":") ? 1 : 0;
      return rightStructured - leftStructured || String(left.title?.zh || "").localeCompare(String(right.title?.zh || ""), "zh-CN");
    });
}

function interleaveHome(items) {
  const buckets = new Map(SURFACE_ORDER.map((surface) => [surface, []]));
  for (const item of items) buckets.get(item._surface)?.push(item);
  const result = [];
  let added = true;
  while (added) {
    added = false;
    for (const surface of SURFACE_ORDER) {
      const bucket = buckets.get(surface);
      if (bucket?.length) {
        result.push(bucket.shift());
        added = true;
      }
    }
  }
  return result;
}

function pageSizeForView(view = state.currentView) {
  return view === "home" || window.matchMedia("(max-width: 520px)").matches
    ? COMPACT_PAGE_SIZE
    : PAGE_SIZE;
}

function getFilteredItems() {
  const queries = expandSearchQuery(dom.searchInput.value);
  let items = getViewItems().filter((item) => !queries.length || queries.some((query) => item._searchText.includes(query)));

  items = items.filter((item) => itemMatchesMode(item, state.activeMode));
  items = items.filter((item) => itemMatchesMode(item, state.secondaryMode));

  if (state.currentView === "home" && !SURFACE_ORDER.includes(state.activeMode)) {
    items = interleaveHome(items);
  }

  return items;
}

function renderSurfaceOverview() {
  dom.surfaceOverview.hidden = state.currentView !== "home";
  if (state.currentView !== "home") return;
  dom.surfaceGrid.replaceChildren();

  for (const surface of SURFACE_ORDER) {
    const config = SURFACES[surface];
    const workflowCounts = workflowInventoryCounts();
    const count = surface === "workflows"
      ? workflowCounts.published + workflowCounts.researching
      : surface === "models"
        ? modelInventoryCount()
        : state.items.filter((item) => item._surfaces?.includes(surface)).length;
    const button = createElement("button", "surface-card");
    button.type = "button";
    button.dataset.surfaceTarget = surface;
    button.dataset.surface = surface;
    const navIcon = document.querySelector(`.nav-item[data-view="${surface}"] .nav-icon svg`);
    const icon = createElement("span", "surface-icon");
    if (navIcon) icon.append(navIcon.cloneNode(true));
    const copy = createElement("span", "surface-card-copy");
    copy.append(createElement("strong", "", localizedText(config.label)));
    const countLabel = surface === "workflows"
      ? `${formatCount(workflowCounts.published)}+${formatCount(workflowCounts.researching)}`
      : formatCount(count);
    copy.append(createElement("span", "", countLabel));
    if (surface === "workflows") {
      button.title = state.currentLang === "zh"
        ? `${workflowCounts.published} 条正式、${workflowCounts.researching} 条候选`
        : `${workflowCounts.published} published, ${workflowCounts.researching} research candidates`;
    }
    button.append(icon, copy);
    dom.surfaceGrid.append(button);
  }
}

function cardSourceSummary(item) {
  const sources = localized(item.sources, [], state.currentLang);
  const first = Array.isArray(sources) ? sources[0] : sources;
  if (!first) return "";
  const descriptor = sourceDescriptor(first);
  return descriptor.domain || descriptor.label || "";
}

function cardTagLabels(item) {
  const tags = localized(item.tags, [], state.currentLang);
  return (Array.isArray(tags) ? tags : [tags]).filter(Boolean).map((tag) => String(tag));
}

function createFavoriteButton(item) {
  const favorite = createElement("button", "favorite-button");
  favorite.type = "button";
  favorite.dataset.action = "favorite";
  favorite.dataset.id = item.id;
  const isFavorite = state.favorites.has(item.id);
  favorite.setAttribute("aria-pressed", String(isFavorite));
  favorite.setAttribute("aria-label", isFavorite ? translate("unfavorite") : translate("favorite"));
  favorite.append(createIcon("star"));
  return favorite;
}

function appendCardTags(container, labels, className = "card-taxonomy-chip") {
  if (!labels.length) return;
  const taxonomy = createElement("span", "card-taxonomy");
  for (const label of labels) taxonomy.append(createElement("span", className, label));
  container.append(taxonomy);
}

function createAgentResourceCard(item, index) {
  const resourceType = item._resourceType === "mcp" ? "mcp" : "skill";
  const resourceLabel = translate(resourceType === "mcp" ? "resourceMcp" : "resourceSkill");
  const card = createElement("article", "card card-enter agent-resource-card");
  card.setAttribute("role", "listitem");
  card.dataset.surface = "agents";
  card.dataset.id = item.id;
  card.dataset.resourceType = resourceType;
  card.style.setProperty("--enter-delay", `${Math.min(index, 12) * 18}ms`);
  if (state.selectedId === item.id) card.classList.add("is-selected");

  const openButton = createElement("button", "agent-resource-open");
  openButton.type = "button";
  openButton.dataset.action = "open";
  openButton.dataset.id = item.id;
  openButton.setAttribute("aria-label", `${localizedText(item.title)}，${translate("contentLabel")}`);

  const mark = createElement("span", "resource-kind-mark", resourceType === "mcp" ? "MCP" : "AG");
  const body = createElement("span", "resource-card-body");
  const topline = createElement("span", "resource-card-topline");
  topline.append(createElement("span", "resource-kind-label", resourceLabel));
  const categoryLabels = categoryLabelsForItem(item, state.currentLang);
  for (const label of categoryLabels) topline.append(createElement("span", "resource-category", label));
  body.append(topline);
  body.append(createElement("strong", "resource-card-title", localizedText(item.title, item.id)));
  body.append(createElement("span", "resource-card-summary", localizedText(item.summary)));

  const meta = createElement("span", "resource-card-meta");
  appendCardTags(meta, cardTagLabels(item));
  const source = cardSourceSummary(item);
  if (source) meta.append(createElement("span", "resource-card-source", `${translate("sourcePrefix")} · ${source}`));
  body.append(meta);

  const action = createElement("span", "resource-card-action");
  action.append(createElement("span", "resource-card-action-label", translate("viewDetails")), createIcon("arrow"));
  openButton.append(mark, body, action);
  card.append(openButton, createFavoriteButton(item));
  return card;
}

function createPromptRecipeCard(item, index) {
  const card = createElement("article", "card card-enter prompt-recipe-card");
  card.setAttribute("role", "listitem");
  card.dataset.surface = "prompts";
  card.dataset.id = item.id;
  card.style.setProperty("--enter-delay", `${Math.min(index, 12) * 18}ms`);
  if (state.selectedId === item.id) card.classList.add("is-selected");

  const openButton = createElement("button", "prompt-recipe-open");
  openButton.type = "button";
  openButton.dataset.action = "open";
  openButton.dataset.id = item.id;
  openButton.setAttribute("aria-label", `${localizedText(item.title)}，${translate("contentLabel")}`);

  const topline = createElement("span", "prompt-recipe-topline");
  topline.append(createElement("span", "card-type-mark", "PR"));
  topline.append(createElement("span", "prompt-recipe-label", translate("promptRecipe")));
  openButton.append(topline);
  openButton.append(createElement("strong", "prompt-recipe-title", localizedText(item.title, item.id)));

  const outcome = createElement("span", "prompt-recipe-outcome");
  outcome.append(createElement("span", "prompt-recipe-field", translate("promptOutcome")), createElement("span", "prompt-recipe-summary", localizedText(item.summary)));
  openButton.append(outcome);

  const labels = promptDisplayLabelsForItem(item);
  if (labels.length) {
    const fit = createElement("span", "prompt-recipe-fit");
    fit.append(createElement("span", "prompt-recipe-field", translate("promptBestFor")));
    appendCardTags(fit, labels);
    openButton.append(fit);
  }

  const footer = createElement("span", "prompt-recipe-footer");
  const source = cardSourceSummary(item);
  if (source) footer.append(createElement("span", "card-domain", `${translate("sourcePrefix")} · ${source}`));
  footer.append(createElement("span", "prompt-recipe-detail", `${translate("viewDetails")} ${String.fromCodePoint(0x2192)}`));
  openButton.append(footer);

  const actions = createElement("span", "card-actions prompt-recipe-actions");
  const copy = createElement("button", "card-copy-button prompt-copy-button");
  copy.type = "button";
  copy.dataset.action = "copy-card";
  copy.dataset.id = item.id;
  copy.setAttribute("aria-label", translate("copyPrompt"));
  copy.title = translate("copyPrompt");
  copy.append(createIcon("copy"), createElement("span", "prompt-copy-label", translate("copyUse")));
  applyCardCopyFeedback(copy, item.id);
  actions.append(copy, createFavoriteButton(item));
  card.append(openButton, actions);
  return card;
}

function toolCategoryLabelForItem(item, language = state.currentLang) {
  const generatedLabel = item?.toolCategoryLabel;
  if (generatedLabel) return localizedText(generatedLabel, "", language);
  const category = TOOL_CATEGORIES.find((candidate) => candidate.id === item?.toolCategory);
  return category ? localizedText(category.label, "", language) : "";
}

function toolCardFooterLabel(item) {
  const category = toolCategoryLabelForItem(item);
  const rawDomain = localizedText(item.domain);
  const domain = normalizeText(rawDomain) === "tool" ? "" : rawDomain;
  if (item?._legacyDirectory && !category) return state.currentLang === "zh" ? "精选目录 · 未核许可" : "Curated directory · license not verified";
  if (category && domain && normalizeText(category) !== normalizeText(domain)) return `${category} · ${domain}`;
  return category || domain || localizedText(item.tags, localizedText(SURFACES.aitools?.label));
}

function createCard(item, index) {
  if (item.type === "workflow" || item._surface === "workflows") return createWorkflowCard(item, index);
  const surface = effectiveSurfaceForItem(item);
  if (surface === "agents") return createAgentResourceCard(item, index);
  if (surface === "prompts") return createPromptRecipeCard(item, index);
  const config = SURFACES[surface] || SURFACES.knowledge;
  const modelCompany = surface === "models" ? modelCompanyForItem(item) : null;
  const activeCategoryMode = [state.activeMode, state.secondaryMode]
    .find((mode) => mode.startsWith("category:"));
  const activeCategoryId = activeCategoryMode ? activeCategoryMode.slice("category:".length) : "";
  const categoryLabels = surface === "prompts"
    ? promptDisplayLabelsForItem(item)
    : categoryLabelsForItem(item, state.currentLang, activeCategoryId);
  const card = createElement("article", "card card-enter");
  card.setAttribute("role", "listitem");
  card.dataset.surface = surface;
  card.dataset.id = item.id;
  if (surface === "knowledge") {
    card.dataset.knowledgeType = item._knowledgeType;
    card.dataset.level = item.level || "beginner";
  }
  if (item._categoryIds?.length) {
    const primaryCategory = item._categoryIds.includes(activeCategoryId) ? activeCategoryId : item._categoryIds[0];
    card.dataset.category = primaryCategory;
    card.dataset.categories = item._categoryIds.join(" ");
  }
  if (modelCompany) {
    card.dataset.company = modelCompany.id;
    card.style.setProperty("--surface-accent", modelCompany.accent);
  }
  card.style.setProperty("--enter-delay", `${Math.min(index, 12) * 18}ms`);
  if (state.selectedId === item.id) card.classList.add("is-selected");

  const openButton = createElement("button", "card-open");
  openButton.type = "button";
  openButton.dataset.action = "open";
  openButton.dataset.id = item.id;
  openButton.setAttribute("aria-label", `${localizedText(item.title)}，${translate("contentLabel")}`);

  const topline = createElement("span", "card-topline");
  const logo = modelCompany
    ? { name: localizedText(modelCompany.label), src: modelCompany.logo }
    : MODEL_LOGOS[item.id];
  if (logo) {
    const logoWrap = createElement("span", "card-logo");
    const image = document.createElement("img");
    image.src = logo.src;
    image.alt = logo.name;
    image.loading = "lazy";
    image.decoding = "async";
    logoWrap.append(image);
    topline.append(logoWrap);
  } else {
    topline.append(createElement("span", "card-type-mark", config.mark));
  }
  const category = localizedText(item.category, localizedText(config.label));
  topline.append(createElement(
    "span",
    "card-kicker",
    modelCompany ? localizedText(modelCompany.label)
      : /^(?:knowledge|model|agent|prompt|workflow|tool|lab)$/iu.test(category)
        ? localizedText(config.label)
        : category,
  ));
  if (item.updated) topline.append(createElement("time", "card-updated", item.updated));

  const title = createElement("span", "card-title", localizedText(item.title, item.id));
  title.setAttribute("role", "heading");
  title.setAttribute("aria-level", "3");
  const modelMeta = createElement("span", "card-model-meta");
  if (surface === "models") {
    modelMeta.append(createElement("span", "card-model-series", localizedText(item.series, localizedText(item.provider))));
    if (item.modelType) modelMeta.append(createElement("span", "card-model-type", localizedText(item.modelType)));
  }
  const taxonomy = createElement("span", "card-taxonomy");
  if (categoryLabels.length) {
    for (const label of categoryLabels) {
      taxonomy.append(createElement("span", "card-taxonomy-chip", label));
    }
  }
  const summary = createElement("span", "card-summary", localizedText(item.summary));
  const footer = createElement("span", "card-footer");
  const footerLabel = surface === "models"
    ? localizedText(item.contextWindow, localizedText(item.domain, localizedText(config.label)))
    : surface === "aitools"
      ? toolCardFooterLabel(item)
    : surface === "knowledge"
      ? localizedText(
        KNOWLEDGE_DOMAINS.find((domain) => item._knowledgeDomainIds?.includes(domain.id))?.label,
        localizedText(item.domain, localizedText(config.label)),
      )
    : localizedText(item.domain, localizedText(config.label));
  footer.append(createElement("span", "card-domain", footerLabel));
  const arrow = createElement("span", "card-arrow");
  arrow.append(createIcon("arrow"));
  footer.append(arrow);
  openButton.append(topline, title);
  if (surface === "models") openButton.append(modelMeta);
  if (categoryLabels.length) openButton.append(taxonomy);
  openButton.append(summary, footer);

  const favorite = createElement("button", "favorite-button");
  favorite.type = "button";
  favorite.dataset.action = "favorite";
  favorite.dataset.id = item.id;
  const isFavorite = state.favorites.has(item.id);
  favorite.setAttribute("aria-pressed", String(isFavorite));
  favorite.setAttribute("aria-label", isFavorite ? translate("unfavorite") : translate("favorite"));
  favorite.append(createIcon("star"));

  const actions = createElement("span", "card-actions");
  if (surface === "prompts") {
    const copy = createElement("button", "card-copy-button");
    copy.type = "button";
    copy.dataset.action = "copy-card";
    copy.dataset.id = item.id;
    copy.setAttribute("aria-label", translate("copyPrompt"));
    copy.title = translate("copyPrompt");
    copy.append(createIcon("copy"));
    applyCardCopyFeedback(copy, item.id);
    actions.append(copy);
  }
  actions.append(favorite);
  card.append(openButton, actions);
  return card;
}

function createWorkflowCard(workflow, index) {
  const card = createElement("article", "workflow-card workflow-catalog-card card-enter");
  card.dataset.id = workflow.id;
  card.dataset.tutorialKind = workflow.tutorial_kind || "researching";
  card.setAttribute("role", "listitem");
  card.style.setProperty("--enter-delay", `${Math.min(index, 11) * 28}ms`);
  const button = createElement("button", "workflow-card-open");
  button.type = "button";
  button.dataset.action = "open-workflow";
  button.dataset.id = workflow.id;
  button.append(
    createElement("strong", "workflow-card-title", localizedText(workflow.title, workflow.id)),
    createElement("span", "workflow-card-summary", localizedText(workflow.summary, "") || localizedText(workflow.goal, "")),
  );
  const footer = createElement("span", "workflow-card-footer");
  footer.append(createElement("span", "", workflowCategoryLabel(workflow.category)));
  footer.append(createElement(
    "span",
    workflow.verification_status === "researching" ? "workflow-card-researching" : "workflow-card-kind",
    window.KnowledgeCosmosWorkflowUI.tutorialLabel(workflow, state.currentLang),
  ));
  footer.append(createIcon("arrow"));
  button.append(footer);
  card.append(button, createFavoriteButton(workflow));
  return card;
}

function renderCards() {
  if (state.currentView === "my" || state.currentView === "team") {
    renderWorkspaceView(state.currentView);
    return;
  }
  if (state.currentView === "workflows") {
    const queries = expandSearchQuery(dom.searchInput.value);
    const workflows = state.workflows.filter((workflow) => {
      if (state.activeMode === "saved" && !state.favorites.has(workflow.id)) return false;
      if (!queries.length) return true;
      const haystack = normalizeText([
        workflow.id,
        workflow.title,
        workflow.summary,
        workflow.goal,
        ...(workflow.required_inputs || []),
        ...(workflow.steps || []).map((step) => `${step.title} ${step.instructions}`),
        ...(workflow.tool_ids || []),
      ].join(" "));
      return queries.some((query) => haystack.includes(query));
    });
    const visibleWorkflows = workflows.slice(0, state.visibleCount);
    dom.contentGrid.replaceChildren();
    dom.contentGrid.dataset.view = state.currentView;
    dom.contentGrid.setAttribute("aria-busy", "true");
    const fragment = document.createDocumentFragment();
    visibleWorkflows.forEach((workflow, index) => fragment.append(createWorkflowCard(workflow, index)));
    dom.contentGrid.append(fragment);
    dom.contentGrid.hidden = workflows.length === 0;
    dom.emptyState.hidden = workflows.length > 0;
    dom.loadMoreWrap.hidden = visibleWorkflows.length >= workflows.length || workflows.length === 0;
    dom.loadMoreCount.textContent = workflows.length > visibleWorkflows.length
      ? translate("remaining", formatCount(workflows.length - visibleWorkflows.length))
      : "";
    dom.resultCount.textContent = translate("itemsShown", formatCount(visibleWorkflows.length), formatCount(workflows.length));
    dom.clearSearch.hidden = !dom.searchInput.value;
    dom.resetFilters.hidden = !dom.searchInput.value;
    dom.contentGrid.setAttribute("aria-busy", "false");
    dom.emptyTitle.textContent = translate("emptyTitle");
    dom.emptyHint.textContent = state.currentLang === "zh" ? "还没有匹配的工作流，换一个任务词试试。" : "No workflows match this search yet.";
    dom.emptyAction.textContent = translate("resetFilters");
    return;
  }
  const items = getFilteredItems();
  const visibleItems = items.slice(0, state.visibleCount);
  dom.contentGrid.replaceChildren();
  dom.contentGrid.dataset.view = state.currentView;
  dom.contentGrid.setAttribute("aria-busy", "true");

  const fragment = document.createDocumentFragment();
  visibleItems.forEach((item, index) => fragment.append(createCard(item, index)));
  dom.contentGrid.append(fragment);
  dom.contentGrid.hidden = items.length === 0;
  dom.emptyState.hidden = items.length > 0;
  dom.loadMoreWrap.hidden = visibleItems.length >= items.length || items.length === 0;
  dom.loadMoreCount.textContent = items.length > visibleItems.length
    ? translate("remaining", formatCount(items.length - visibleItems.length))
    : "";
  dom.resultCount.textContent = translate("itemsShown", formatCount(visibleItems.length), formatCount(items.length));
  dom.clearSearch.hidden = !dom.searchInput.value;
  dom.resetFilters.hidden = !dom.searchInput.value && state.activeMode === "all" && state.secondaryMode === "all";
  dom.contentGrid.setAttribute("aria-busy", "false");

  const isSavedEmpty = state.activeMode === "saved" && items.length === 0;
  dom.emptyTitle.textContent = isSavedEmpty ? translate("emptySavedTitle") : translate("emptyTitle");
  dom.emptyHint.textContent = isSavedEmpty ? translate("emptySavedHint") : translate("emptyHint");
  dom.emptyAction.textContent = isSavedEmpty ? translate("viewAll") : translate("resetFilters");
}

function renderWorkspaceView(view) {
  const isMy = view === "my";
  const workspaceItems = new Map(state.items.map((item) => [item.id, item]));
  for (const workflow of state.workflows) workspaceItems.set(workflow.id, workflow);
  const queries = expandSearchQuery(dom.searchInput.value);
  const matches = (item) => !queries.length || queries.some((query) => (
    (item._searchText || normalizeText([item.id, localizedText(item.title), localizedText(item.summary), item.goal || ""].join(" "))).includes(query)
  ));
  const allFavorites = [...workspaceItems.values()].filter((item) => state.favorites.has(item.id));
  const allRecent = state.recentItems
    .map((id) => workspaceItems.get(id))
    .filter(Boolean);
  const favoriteItems = allFavorites.filter(matches);
  const recentItems = allRecent.filter(matches);
  dom.contentGrid.replaceChildren();
  dom.contentGrid.dataset.view = view;
  dom.contentGrid.hidden = false;
  dom.emptyState.hidden = true;
  dom.loadMoreWrap.hidden = true;
  dom.clearSearch.hidden = !dom.searchInput.value;
  dom.resetFilters.hidden = !dom.searchInput.value;
  dom.resultCount.textContent = isMy
    ? (queries.length
      ? (state.currentLang === "zh" ? `收藏 ${formatCount(favoriteItems.length)}/${formatCount(allFavorites.length)} 条 · 最近 ${formatCount(recentItems.length)}/${formatCount(allRecent.length)} 条` : `Saved ${formatCount(favoriteItems.length)}/${formatCount(allFavorites.length)} · Recent ${formatCount(recentItems.length)}/${formatCount(allRecent.length)}`)
      : (state.currentLang === "zh" ? `已收藏 ${formatCount(favoriteItems.length)} 条 · 最近 ${formatCount(recentItems.length)} 条` : `${formatCount(favoriteItems.length)} saved · ${formatCount(recentItems.length)} recent`))
    : "";

  if (isMy) {
    const summary = createElement("section", "workspace-toolbar");
    summary.append(createElement("h3", "", state.currentLang === "zh" ? "收藏与最近浏览" : "Saved and recent"));
    const localActions = createElement("div", "workspace-local-actions");
    const actionButton = (label, action, icon = null) => {
      const button = createElement("button", "secondary-button");
      button.type = "button";
      button.dataset.action = action;
      button.title = label;
      if (icon) button.append(createIcon(icon));
      button.append(createElement("span", "", label));
      return button;
    };
    const file = document.createElement("input");
    file.type = "file";
    file.id = "workspaceImportFile";
    file.accept = ".json,application/json";
    file.hidden = true;
    file.addEventListener("change", () => {
      const selected = file.files?.[0];
      if (selected) importLocalWorkspace(selected);
      file.value = "";
    });
    const exportButton = actionButton(translate("workspaceExport"), "export-local-workspace", "download");
    exportButton.disabled = !state.favorites.size && !state.recentItems.length;
    const importButton = actionButton(translate("workspaceImport"), "import-local-workspace", "upload");
    importButton.disabled = state.workspaceImportPending;
    importButton.setAttribute("aria-busy", String(state.workspaceImportPending));
    const clearRecentButton = actionButton(state.currentLang === "zh" ? "清空浏览记录" : "Clear recent", "clear-recent-workspace");
    clearRecentButton.disabled = (!state.recentItems.length && !state.workspaceReadErrors.has(STORAGE_KEYS.recent)) || state.workspaceImportPending;
    const clearAllButton = actionButton(state.currentLang === "zh" ? "清空本地数据" : "Clear local data", "clear-local-workspace");
    clearAllButton.classList.add("workspace-clear-all");
    clearAllButton.disabled = (!state.favorites.size && !state.recentItems.length && !state.workspaceReadErrors.size) || state.workspaceImportPending;
    const dataActions = createElement("div", "workspace-action-group");
    dataActions.append(exportButton, importButton);
    const clearActions = createElement("div", "workspace-action-group workspace-clear-actions");
    clearActions.append(clearRecentButton, clearAllButton);
    localActions.append(dataActions, clearActions, file);
    summary.append(localActions);
    const unavailable = state.favorites.size - allFavorites.length;
    if (unavailable) {
      summary.append(createElement("p", "workspace-unavailable", state.currentLang === "zh" ? `${formatCount(unavailable)} 条收藏暂不可用` : `${formatCount(unavailable)} saved items are unavailable`));
    }
    const errorKey = workspaceErrorKey();
    if (errorKey) summary.append(createElement("p", "workspace-error", translate(errorKey)));
    dom.contentGrid.append(summary);
    if (!favoriteItems.length && !recentItems.length) {
      dom.emptyState.hidden = false;
      dom.emptyTitle.textContent = queries.length ? translate("emptyTitle") : (state.currentLang === "zh" ? "还没有可显示的收藏" : "No saved items to display");
      dom.emptyHint.textContent = "";
      dom.emptyAction.textContent = queries.length ? translate("resetFilters") : (state.currentLang === "zh" ? "去首页" : "Go home");
    }
    if (favoriteItems.length) {
      const favoriteHeading = createElement("h3", "workspace-section-title", state.currentLang === "zh" ? "我的收藏" : "Saved items");
      dom.contentGrid.append(favoriteHeading);
      const fragment = document.createDocumentFragment();
      favoriteItems.forEach((item, index) => fragment.append(createCard(item, index)));
      dom.contentGrid.append(fragment);
    }
    if (recentItems.length) {
      const recentHeading = createElement("h3", "workspace-section-title", state.currentLang === "zh" ? "最近浏览" : "Recent");
      dom.contentGrid.append(recentHeading);
      const fragment = document.createDocumentFragment();
      recentItems.forEach((item, index) => fragment.append(createCard(item, index)));
      dom.contentGrid.append(fragment);
    }
    return;
  }

  const status = createElement("section", "workspace-team-status");
  status.append(createElement("h3", "", state.currentLang === "zh" ? "团队空间尚未启用" : "Team workspace is not available"));
  dom.contentGrid.append(status);
}

function createModeTab(mode, label, { axis = "primary", company = null, category = null, count = null, disabled = false } = {}) {
  const button = createElement("button", "mode-tab");
  button.type = "button";
  button.setAttribute("role", "tab");
  if (axis === "secondary") button.dataset.secondaryMode = mode;
  else button.dataset.mode = mode;
  button.setAttribute("aria-selected", "false");
  button.setAttribute("aria-controls", "contentGrid");
  button.tabIndex = -1;
  button.disabled = disabled;
  if (company) {
    button.classList.add("company-mode-tab");
    button.dataset.company = company.id;
    button.style.setProperty("--surface-accent", company.accent);
    const image = document.createElement("img");
    image.className = "mode-company-logo";
    image.src = company.logo;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;
    const copy = createElement("span", "mode-tab-copy");
    copy.append(createElement("span", "mode-tab-label", label));
    if (count !== null) copy.append(createElement("span", "mode-tab-count", formatCount(count)));
    button.append(image, copy);
  } else if (category || count !== null) {
    if (category) {
      button.classList.add("category-mode-tab");
      button.dataset.category = category.id;
    }
    const copy = createElement("span", "mode-tab-copy");
    copy.append(createElement("span", "mode-tab-label", label));
    if (count !== null) copy.append(createElement("span", "mode-tab-count", formatCount(count)));
    button.append(copy);
  } else {
    button.textContent = label;
  }
  return button;
}

function updateModeTabs() {
  const tabsVisible = ["knowledge", "models", "agents", "prompts", "aitools"].includes(state.currentView);
  const previousPrimaryScroll = dom.modeTabs.scrollLeft;
  const previousSecondaryScroll = dom.secondaryTabs.scrollLeft;
  const viewItems = getViewItems(state.currentView);
  const primaryFilters = primaryFiltersForView(state.currentView);
  const secondaryFilters = secondaryFiltersForView(state.currentView);
  dom.modeTabs.replaceChildren();
  dom.secondaryTabs.replaceChildren();

  for (const [tabs, frame, previousScroll] of [
    [dom.modeTabs, dom.modeTabsFrame, previousPrimaryScroll],
    [dom.secondaryTabs, dom.secondaryTabsFrame, previousSecondaryScroll],
  ]) {
    tabs.classList.add("scrollable-tabs");
    frame.classList.add("has-scroll-controls");
    tabs.scrollLeft = previousScroll;
  }

  dom.secondaryTabs.classList.toggle("company-tabs", state.currentView === "models");
  const primaryBase = viewItems.filter((item) => itemMatchesMode(item, state.secondaryMode));
  const secondaryBase = viewItems.filter((item) => itemMatchesMode(item, state.activeMode));

  dom.modeTabs.append(createModeTab("all", translate("modeAll"), { count: primaryBase.length }));
  for (const filter of primaryFilters) {
    const totalCount = viewItems.filter((item) => itemMatchesMode(item, filter.mode)).length;
    if (!totalCount) continue;
    const count = primaryBase.filter((item) => itemMatchesMode(item, filter.mode)).length;
    dom.modeTabs.append(createModeTab(filter.mode, localizedText(filter.label), {
      category: filter.category,
      count,
      disabled: count === 0 && state.activeMode !== filter.mode,
    }));
  }

  dom.secondaryTabs.append(createModeTab("all", translate("modeAll"), { axis: "secondary", count: secondaryBase.length }));
  for (const filter of secondaryFilters) {
    const totalCount = viewItems.filter((item) => itemMatchesMode(item, filter.mode)).length;
    if (!totalCount) continue;
    const count = secondaryBase.filter((item) => itemMatchesMode(item, filter.mode)).length;
    dom.secondaryTabs.append(createModeTab(filter.mode, localizedText(filter.label), {
      axis: "secondary",
      company: filter.company,
      category: filter.category,
      count,
      disabled: count === 0 && state.secondaryMode !== filter.mode,
    }));
  }

  dom.modeTabs.querySelectorAll("[data-mode]").forEach((button) => {
    const active = button.dataset.mode === state.activeMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  dom.secondaryTabs.querySelectorAll("[data-secondary-mode]").forEach((button) => {
    const active = button.dataset.secondaryMode === state.secondaryMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  dom.modeTabsFrame.hidden = !tabsVisible;
  dom.modeTabs.hidden = !tabsVisible;
  const secondaryVisible = tabsVisible && state.currentView !== "prompts";
  dom.secondaryFilterAxis.hidden = !secondaryVisible;
  dom.libraryToolbar.hidden = !tabsVisible;
  dom.modeTabsPrev.hidden = !tabsVisible;
  dom.modeTabsNext.hidden = !tabsVisible;
  dom.secondaryTabsPrev.hidden = !secondaryVisible;
  dom.secondaryTabsNext.hidden = !secondaryVisible;
  if (dom.savedFilter) {
    const saved = state.activeMode === "saved";
    dom.savedFilter.setAttribute("aria-pressed", String(saved));
    dom.savedFilter.setAttribute("aria-label", translate(saved ? "clearSavedFilter" : "savedFilter"));
    dom.savedFilter.title = translate(saved ? "clearSavedFilter" : "savedFilter");
  }
  window.requestAnimationFrame(updateTabScrollAffordance);
}

function updateSingleTabScrollAffordance(tabs, frame, previousButton, nextButton) {
  const maxScroll = Math.max(0, tabs.scrollWidth - tabs.clientWidth);
  const usesScrollControls = tabs.classList.contains("scrollable-tabs");
  const hasOverflow = usesScrollControls && maxScroll > 1;
  const canScrollStart = hasOverflow && tabs.scrollLeft > 2;
  const canScrollEnd = hasOverflow && tabs.scrollLeft < maxScroll - 2;
  tabs.classList.toggle("can-scroll-start", canScrollStart);
  tabs.classList.toggle("can-scroll-end", canScrollEnd);
  frame.classList.toggle("tabs-fit", usesScrollControls && !hasOverflow);
  previousButton.disabled = !canScrollStart;
  nextButton.disabled = !canScrollEnd;
}

function updateTabScrollAffordance() {
  updateSingleTabScrollAffordance(dom.modeTabs, dom.modeTabsFrame, dom.modeTabsPrev, dom.modeTabsNext);
  updateSingleTabScrollAffordance(dom.secondaryTabs, dom.secondaryTabsFrame, dom.secondaryTabsPrev, dom.secondaryTabsNext);
}

function scrollModeTabs(tabs, direction) {
  if (!tabs.classList.contains("scrollable-tabs")) return;
  const distance = Math.max(160, Math.round(tabs.clientWidth * 0.72));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  tabs.scrollBy({
    left: direction * distance,
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

function renderAll() {
  applyTranslations();
  renderNav();
  renderHeader();
  renderTaskEntries();
  renderWorkflowOverview();
  renderSurfaceOverview();
  renderHomeLeaderboard();
  renderLeaderboard();
  renderSkillLeaderboard();
  updateModeTabs();
  renderCards();
  if (state.selectedId) {
    const item = state.items.find((candidate) => candidate.id === state.selectedId);
    if (item) renderPanel(item);
  }
}

function parseRouteHash() {
  const raw = window.location.hash.slice(1);
  const [view, query = ""] = raw.split("?");
  const params = new URLSearchParams(query);
  return { view, taskId: params.get("task") || null, channelId: params.get("channel") || null };
}

function updateHash(view, replace = false, taskId = null, channelId = null) {
  const params = new URLSearchParams();
  if (taskId) params.set("task", taskId);
  if (channelId) params.set("channel", channelId);
  const query = params.toString() ? `?${params.toString()}` : "";
  const nextHash = `#${view}${query}`;
  if (window.location.hash === nextHash) return;
  if (replace) window.history.replaceState(null, "", nextHash);
  else window.history.pushState(null, "", nextHash);
}

function switchView(view, options = {}) {
  if (view === "team") view = "my";
  if (!VIEWS[view] || view === state.currentView && !options.force) return;
  const shouldPush = options.push !== false;
  state.currentView = view;
  state.activeTaskId = options.taskId || null;
  state.activeTaskChannel = options.taskChannel || null;
  state.workflowExpanded = taskChannelForId(state.activeTaskId, state.activeTaskChannel)?.kind === "workflows";
  state.workflowTaskFilter = state.workflowExpanded ? state.activeTaskId : null;
  if (view !== "home") state.workflowTaskFilter = null;
  state.activeMode = "all";
  state.secondaryMode = "all";
  applyTaskFilters(state.activeTaskId);
  state.visibleCount = pageSizeForView(view);
  dom.searchInput.value = "";
  setSearchExpanded(false);
  closePanel({ restoreFocus: false });
  updateHash(view, !shouldPush, state.activeTaskId, state.activeTaskChannel);
  renderAll();
  playViewSwap();
  resetViewScroll({ userInitiated: options.userInitiated === true });
  if (options.focus !== false) window.requestAnimationFrame(() => dom.mainContent.focus({ preventScroll: true }));
}

function setMode(mode) {
  const validModes = ["all", "saved", ...SURFACE_ORDER, ...primaryFiltersForView(state.currentView).map((filter) => filter.mode)];
  const validMode = validModes.includes(mode);
  if (!validMode) return;
  if (mode === "saved" && state.activeMode === "saved") mode = "all";
  const restoreTabFocus = dom.modeTabs.contains(document.activeElement);
  state.activeMode = mode;
  const hasCombination = getViewItems().some((item) => itemMatchesMode(item, state.activeMode) && itemMatchesMode(item, state.secondaryMode));
  if (!hasCombination) state.secondaryMode = "all";
  state.visibleCount = pageSizeForView();
  updateModeTabs();
  renderCards();
  if (restoreTabFocus) {
    window.requestAnimationFrame(() => {
      const activeTab = [...dom.modeTabs.querySelectorAll("[data-mode]")]
        .find((button) => button.dataset.mode === mode);
      activeTab?.focus({ preventScroll: true });
    });
  }
}

function setSecondaryMode(mode) {
  const validModes = ["all", ...secondaryFiltersForView(state.currentView).map((filter) => filter.mode)];
  if (!validModes.includes(mode)) return;
  const restoreTabFocus = dom.secondaryTabs.contains(document.activeElement);
  state.secondaryMode = mode;
  state.visibleCount = pageSizeForView();
  updateModeTabs();
  renderCards();
  if (restoreTabFocus) {
    window.requestAnimationFrame(() => {
      const activeTab = [...dom.secondaryTabs.querySelectorAll("[data-secondary-mode]")]
        .find((button) => button.dataset.secondaryMode === mode);
      activeTab?.focus({ preventScroll: true });
    });
  }
}

function resetFilters() {
  dom.searchInput.value = "";
  state.activeMode = "all";
  state.secondaryMode = "all";
  state.visibleCount = pageSizeForView();
  updateModeTabs();
  renderCards();
}

function resetViewScroll({ userInitiated = false } = {}) {
  if (userInitiated || document.body.classList.contains("entry-complete")) {
    window.KnowledgeCosmosEntry?.dismiss?.({ force: userInitiated });
  }
  const previousBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  window.requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = previousBehavior;
  });
}

function setSearchExpanded(expanded, { focus = false } = {}) {
  if (!dom.headerSearch) return;
  dom.headerSearch.classList.toggle("is-open", expanded);
  dom.searchToggle.setAttribute("aria-expanded", String(expanded));
  dom.searchToggle.setAttribute("aria-label", expanded ? translate("close") : translate("searchLabel"));
  if (focus) {
    window.requestAnimationFrame(() => {
      dom.searchInput.focus({ preventScroll: true });
      dom.searchInput.select();
    });
  }
}

function toggleFavorite(id) {
  if (!id) return;
  const next = new Set(state.favorites);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  if (!persistWorkspacePatch({ [STORAGE_KEYS.favorites]: JSON.stringify([...next]) })) return;
  state.favorites = next;
  renderCards();
  if (state.selectedWorkflowId === id || state.selectedId === id) {
    const isFavorite = state.favorites.has(id);
    dom.panelSave.setAttribute("aria-pressed", String(isFavorite));
    dom.panelSave.setAttribute("aria-label", isFavorite ? translate("unfavorite") : translate("favorite"));
  }
}

function extractUrl(value) {
  const match = String(value || "").match(/(?:https?:\/\/|www\.)[^\s)]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)]*)?/i);
  if (!match) return null;
  const candidate = match[0].replace(/[.,;]+$/, "");
  try {
    return new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`).href;
  } catch {
    return null;
  }
}

function sourceDomain(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function sourceLabel(label, url) {
  const raw = String(label || "").trim();
  if (!url) return raw;
  const withoutUrl = raw
    .replace(/(?:https?:\/\/|www\.)[^\s)]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)]*)?/gi, "")
    .replace(/^[\s·:：|—-]+|[\s·:：|—-]+$/g, "")
    .trim();
  return withoutUrl || sourceDomain(url);
}

function sourceDescriptor(source) {
  if (!source || typeof source !== "object") {
    const label = String(source || "").trim();
    const url = extractUrl(label);
    return { label: sourceLabel(label, url), url, domain: sourceDomain(url) };
  }

  const directUrl = source.url || source.href || source.link;
  if (directUrl) {
    const url = extractUrl(directUrl);
    const label = String(source.label || source.title || source.name || directUrl).trim();
    return { label: sourceLabel(label, url), url, domain: sourceDomain(url) };
  }

  const [entry] = Object.entries(source);
  if (!entry) return { label: "", url: null, domain: "" };
  const [kind, value] = entry;
  const sourceValue = String(value || "").trim();
  const repositoryPath = sourceValue.replace(/^\/+|\/+$/g, "");
  const url = extractUrl(sourceValue)
    || (/github/i.test(kind) && /^[\w.-]+\/[\w.-]+(?:\/[\w./-]+)?$/.test(repositoryPath)
      ? `https://github.com/${repositoryPath}`
      : null);
  return { label: sourceLabel(`${kind} · ${sourceValue}`, url), url, domain: sourceDomain(url) };
}

function renderSources(values) {
  dom.panelSources.replaceChildren();
  const sources = Array.isArray(values) ? values : [];
  if (!sources.length) {
    dom.panelSources.append(createElement("li", "panel-empty", translate("noSource")));
    return null;
  }
  let firstUrl = null;
  for (const source of sources) {
    const li = createElement("li", "panel-source-item");
    const { label, url, domain } = sourceDescriptor(source);
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.append(createElement("span", "panel-source-title", label || domain));
      if (domain && domain !== label) link.append(createElement("span", "panel-source-domain", domain));
      li.append(link);
      if (!firstUrl) firstUrl = url;
    } else {
      li.textContent = label || translate("noSource");
    }
    dom.panelSources.append(li);
  }
  return firstUrl;
}

function renderList(container, values, emptyText) {
  container.replaceChildren();
  const list = Array.isArray(values) ? values : [];
  if (!list.length) {
    container.append(createElement("li", "panel-empty", emptyText));
    return;
  }
  for (const value of list) {
    const item = createElement("li", "");
    appendAutoLinkedText(item, String(value));
    container.append(item);
  }
}

function cleanInlineMarkdown(value) {
  return String(value)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

const AUTO_LINK_PATTERN = /\[([^\]]+)\]\(((?:https?:\/\/|www\.)[^\s)]+)\)|(?:https?:\/\/|www\.)[^\s<>"'“”‘’，。！？；：、（）【】《》]+|(?<![\w@])(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"'“”‘’，。！？；：、（）【】《》]*)?/gi;

function splitUrlSuffix(value) {
  const match = String(value || "").match(/^(.+?)([.,;:!?]+)?$/);
  return { urlText: match?.[1] || String(value || ""), suffix: match?.[2] || "" };
}

function appendAutoLinkedText(container, value) {
  const text = String(value ?? "");
  let cursor = 0;
  for (const match of text.matchAll(AUTO_LINK_PATTERN)) {
    const markdownLabel = match[1];
    const raw = markdownLabel ? match[2] : match[0];
    const { urlText, suffix } = splitUrlSuffix(raw);
    const url = extractUrl(urlText);
    if (!url || match.index < cursor) continue;
    if (match.index > cursor) container.append(document.createTextNode(text.slice(cursor, match.index)));
    const link = document.createElement("a");
    link.className = "auto-link";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = markdownLabel || urlText;
    link.title = url;
    container.append(link);
    if (suffix) container.append(document.createTextNode(suffix));
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) container.append(document.createTextNode(text.slice(cursor)));
}

function renderMarkdown(container, markdown) {
  container.replaceChildren();
  const source = String(markdown || "").trim();
  state.panelRawContent = source;
  if (!source) {
    container.append(createElement("p", "panel-empty", translate("noContent")));
    return;
  }

  const lines = source.split(/\r?\n/);
  let paragraph = [];
  let list = null;
  let inCode = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const p = createElement("p", "");
    appendAutoLinkedText(p, paragraph.map(cleanInlineMarkdown).join(" "));
    container.append(p);
    paragraph = [];
  };

  const flushList = () => {
    if (list) container.append(list);
    list = null;
  };

  const flushCode = () => {
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = codeLines.join("\n");
    pre.append(code);
    container.append(pre);
    codeLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      flushParagraph();
      flushList();
      if (inCode) flushCode();
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      codeLines.push(rawLine);
      continue;
    }
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^---+$/.test(line)) {
      flushParagraph();
      flushList();
      container.append(document.createElement("hr"));
      continue;
    }
    const heading = line.match(/^(#{1,5})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length + 2, 5);
      const element = createElement(`h${level}`, "");
      appendAutoLinkedText(element, cleanInlineMarkdown(heading[2]));
      container.append(element);
      continue;
    }
    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const type = ordered ? "ol" : "ul";
      if (!list || list.tagName.toLowerCase() !== type) {
        flushList();
        list = document.createElement(type);
      }
      const item = createElement("li", "");
      appendAutoLinkedText(item, cleanInlineMarkdown((unordered || ordered)[1]));
      list.append(item);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  if (inCode && codeLines.length) flushCode();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decorateGlossaryTerms(container, currentItem) {
  if (currentItem?._surface !== "knowledge") return;
  const aliasMap = new Map();
  for (const item of state.items) {
    if (item._surface !== "knowledge" || item._knowledgeType !== "term" || item.id === currentItem.id) continue;
    const aliases = localized(item.aliases, []);
    const names = [localizedText(item.title), ...(Array.isArray(aliases) ? aliases : [aliases])]
      .map((name) => String(name || "").trim())
      .filter((name) => name.length > 1);
    for (const name of names) aliasMap.set(normalizeText(name), item);
  }
  const names = [...aliasMap.keys()].sort((a, b) => b.length - a.length);
  if (!names.length) return;
  const matcher = new RegExp(`(${names.map(escapeRegExp).join("|")})`, "giu");
  const textNodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("pre, code, a, button, h1, h2, h3, h4, h5")) return NodeFilter.FILTER_REJECT;
      matcher.lastIndex = 0;
      return matcher.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (const textNode of textNodes) {
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    matcher.lastIndex = 0;
    for (const match of textNode.nodeValue.matchAll(matcher)) {
      if (match.index > cursor) fragment.append(document.createTextNode(textNode.nodeValue.slice(cursor, match.index)));
      const item = aliasMap.get(normalizeText(match[0]));
      if (!item) continue;
      const button = createElement("button", "glossary-term", match[0]);
      button.type = "button";
      button.dataset.glossaryId = item.id;
      button.dataset.definition = localizedText(item.summary);
      button.setAttribute("aria-label", `${match[0]}：${localizedText(item.summary)}。点击查看完整解释`);
      fragment.append(button);
      cursor = match.index + match[0].length;
    }
    if (cursor < textNode.nodeValue.length) fragment.append(document.createTextNode(textNode.nodeValue.slice(cursor)));
    textNode.replaceWith(fragment);
  }
}

function modelDetailFallback(item) {
  if (!item || item._surface !== "models") return "";
  const title = localizedText(item.title, item.id);
  const provider = localizedText(item.provider);
  const series = localizedText(item.series);
  const modelType = localizedText(item.modelType);
  const contextWindow = localizedText(item.contextWindow);
  const input = localizedText(item.input, contextWindow);
  const output = localizedText(item.output, modelType);
  const limits = localizedText(item.limits);
  const availability = localizedText(item.availability);
  const aliases = localizedText(item.aliases);
  const capabilities = localizedText(item.capabilities);
  const domain = localizedText(item.domain);
  const tags = localizedText(item.tags);
  const sources = localizedText(item.sources);
  return [
    `## ${title}`,
    "",
    provider ? `**提供商:** ${provider}` : "",
    series ? `**系列:** ${series}` : "",
    item.modelId ? `**Model ID:** \`${item.modelId}\`` : "",
    aliases ? `**Aliases / 产品入口:** ${aliases}` : "",
    modelType ? `**类型:** ${modelType}` : "",
    input ? `**输入:** ${input}` : "",
    output ? `**输出:** ${output}` : "",
    limits ? `**限制:** ${limits}` : "",
    availability ? `**可用性:** ${availability}` : "",
    capabilities ? `**能力:** ${capabilities}` : "",
    domain ? `**适用方向:** ${domain}` : "",
    tags ? `**标签:** ${tags}` : "",
    sources ? `**官方来源:** ${sources}` : "",
    "",
    localizedText(item.summary),
  ].filter(Boolean).join("\n\n");
}

function localizedContentText(value) {
  const result = localized(value, "");
  if (Array.isArray(result)) return result.join("\n");
  return String(result || "");
}

function itemContentText(item) {
  if (!item) return "";
  const content = localizedContentText(state.content[item.id]);
  if (content) return content;
  if (item._surface === "models") return modelDetailFallback(item);
  return localizedText(item.summary);
}

async function writeClipboardText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard copy failed");
}

function applyCardCopyFeedback(button, id) {
  const feedback = state.copyFeedback.get(id);
  const label = translate(feedback?.key || "copyPrompt");
  button.setAttribute("aria-label", label);
  button.title = label;
  button.disabled = feedback?.key === "copyingPrompt";
  button.setAttribute("aria-busy", String(feedback?.key === "copyingPrompt"));
  button.classList.toggle("is-copied", feedback?.key === "copiedPrompt");
}

function setCardCopyFeedback(id, key) {
  window.clearTimeout(state.copyFeedback.get(id)?.timer);
  const feedback = { key, timer: 0 };
  state.copyFeedback.set(id, feedback);
  const update = () => {
    for (const button of dom.contentGrid.querySelectorAll('[data-action="copy-card"]')) {
      if (button.dataset.id === id) applyCardCopyFeedback(button, id);
    }
  };
  update();
  if (key !== "copyingPrompt") {
    feedback.timer = window.setTimeout(() => {
      if (state.copyFeedback.get(id) !== feedback) return;
      state.copyFeedback.delete(id);
      update();
    }, 1800);
  }
}

async function copyItemContent(id) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item || state.copyFeedback.get(id)?.key === "copyingPrompt") return;
  setCardCopyFeedback(id, "copyingPrompt");
  try {
    if (id.startsWith("prompt:") && state.structuredDetailFailed && state.contentStatus === "loaded") {
      state.contentStatus = "idle";
    }
    if (state.contentStatus !== "loaded") await loadContentMap();
    const text = id.startsWith("prompt:") ? state.promptBodies[id] : itemContentText(item);
    if (!text) {
      setCardCopyFeedback(id, "copyPromptFailed");
      return;
    }
    await writeClipboardText(text);
    setCardCopyFeedback(id, "copiedPrompt");
  } catch {
    setCardCopyFeedback(id, "copyPromptFailed");
  }
}

function renderPanelContent(item) {
  if (item?._surface === "models") {
    const modelContent = localized(state.content[item.id] || state.content[`model:${item.id}`], "");
    const modelMarkdown = Array.isArray(modelContent) ? modelContent.join("\n") : modelContent;
    renderMarkdown(dom.panelContent, stripDuplicateLeadingHeading(modelMarkdown || modelDetailFallback(item), localizedText(item.title, item.id)));
    return;
  }
  if (state.contentStatus === "loading") {
    state.panelRawContent = "";
    dom.panelContent.replaceChildren(createElement("p", "panel-empty", translate("contentLoading")));
    return;
  }
  if (state.contentStatus === "error") {
    state.panelRawContent = "";
    dom.panelContent.replaceChildren(createElement("p", "panel-empty", translate("contentLoadError")));
    return;
  }
  if (item.id.startsWith("prompt:") && !state.promptBodies[item.id]) {
    state.panelRawContent = "";
    dom.panelContent.replaceChildren(createElement("p", "panel-empty", translate("contentLoadError")));
    return;
  }
  const localizedContent = localized(state.content[item.id], "");
  const detailMarkdown = Array.isArray(localizedContent) ? localizedContent.join("\n") : localizedContent;
  renderMarkdown(dom.panelContent, stripDuplicateLeadingHeading(detailMarkdown || modelDetailFallback(item), localizedText(item.title, item.id)));
  decorateGlossaryTerms(dom.panelContent, item);
}

function stripDuplicateLeadingHeading(markdown, title) {
  const source = String(markdown || "").trim();
  const firstLine = source.split(/\r?\n/)[0]?.replace(/^#{1,5}\s+/, "").trim();
  if (!firstLine || normalizeText(firstLine) !== normalizeText(title)) return source;
  return source.split(/\r?\n/).slice(1).join("\n").trim();
}

function panelDecisionValues(item, surface, tags, categoryLabels) {
  const firstTag = tags.map((tag) => String(tag)).find(Boolean);
  const firstCategory = categoryLabels.find(Boolean);
  const domain = localizedText(item.domain);
  const provider = localizedText(item.provider);
  const modelType = localizedText(item.modelType);
  const language = state.currentLang;
  const copy = language === "zh"
    ? { use: "适合", type: "类型", updated: "更新" }
    : { use: "Best for", type: "Type", updated: "Updated" };

  let use = domain || firstCategory || firstTag || (language === "zh" ? "继续了解" : "Explore further");
  let type = firstCategory || firstTag || (language === "zh" ? "资料" : "Resource");
  if (surface === "models") {
    use = provider || domain || (language === "zh" ? "模型选型" : "Model selection");
    type = modelType || firstTag || (language === "zh" ? "大模型" : "Model");
  } else if (surface === "agents") {
    use = item._resourceType === "mcp"
      ? (language === "zh" ? "连接外部工具" : "Connect tools")
      : domain || (language === "zh" ? "Agent 工作流" : "Agent workflow");
    type = item._resourceType === "mcp" ? "MCP" : (language === "zh" ? "技能" : "Skill");
  } else if (surface === "prompts") {
    use = firstCategory || (language === "zh" ? "任务提示" : "Task prompt");
    type = language === "zh" ? "提示词" : "Prompt";
  } else if (surface === "aitools") {
    use = domain || firstCategory || (language === "zh" ? "AI 工具" : "AI tool");
    type = firstTag || (language === "zh" ? "工具" : "Tool");
  } else if (surface === "knowledge") {
    use = domain || (language === "zh" ? "建立认知" : "Build understanding");
    type = localizedText(
      KNOWLEDGE_TYPES.find((entry) => entry.id === (item._knowledgeType || item.knowledgeType))?.label,
      localizedText(item.knowledgeType) || firstTag || (language === "zh" ? "知识" : "Knowledge"),
    );
  }

  return { labels: copy, use, type, updated: item.updated || "--" };
}

function relatedIdsForItem(item) {
  if (!item) return [];
  const keys = [
    "related_ids",
    "related_prompt_ids",
    "related_workflow_ids",
    "model_ids",
    "prompt_ids",
    "tool_ids",
    "knowledge_ids",
    "workflow_ids",
  ];
  const ids = [];
  for (const key of keys) {
    if (!Array.isArray(item[key])) continue;
    for (const id of item[key]) if (id && id !== item.id) ids.push(id);
  }
  return [...new Set(ids)];
}

function relatedModelCompanyForId(id) {
  if (!id.startsWith("model:")) return "";
  const slug = id.slice("model:".length);
  if (slug.startsWith("openai")) return "openai";
  if (slug.startsWith("anthropic")) return "anthropic";
  if (slug.startsWith("google")) return "google";
  return "";
}

function modelRelatedIdsForItem(item) {
  if (item?._surface !== "models") return [];
  const ids = [];
  const modelType = String(item.modelType || "");
  const domain = localizedText(item.domain);
  const relatedByType = {
    LLM: [
      "knowledge:ai-foundations-map",
      "prompt:agent-system-boundary",
      "workflow:official-source-research",
    ],
    Reasoning: [
      "knowledge:why-neural-networks",
      "prompt:first-principles-agent",
      "workflow:reliable-ai-automation",
    ],
    Agentic: [
      "prompt:agent-system-boundary",
      "prompt:subagent-delegation-brief",
      "workflow:agent-skill-from-repeated-task",
    ],
    Coding: [
      "prompt:code-review-risk-check",
      "workflow:bounded-repository-change",
      "tool:openai-codex",
    ],
    Multimodal: [
      "knowledge:what-is-multimodal",
      "workflow:knowledge-base-from-documents",
      "workflow:product-design-sprint-with-ai",
    ],
    Image: [
      "knowledge:diffusion-models-basics",
      "prompt:design-critique-with-evidence",
      "workflow:diffusion-image-generation",
    ],
    Video: [
      "knowledge:what-is-multimodal",
      "workflow:ai-short-video-production",
      "tool:video-shotcraft",
    ],
    Router: [
      "prompt:comparative-model-evaluation",
      "workflow:official-source-research",
    ],
  };
  ids.push(...(relatedByType[modelType] || []));
  if (/图像|image|视觉/i.test(domain) && !ids.includes("workflow:diffusion-image-generation")) {
    ids.push("workflow:diffusion-image-generation");
  }
  if (/视频|video/i.test(domain) && !ids.includes("workflow:ai-short-video-production")) {
    ids.push("workflow:ai-short-video-production");
  }
  if (/代码|编程|coding/i.test(domain) && !ids.includes("workflow:bounded-repository-change")) {
    ids.push("workflow:bounded-repository-change");
  }
  const providerTool = {
    anthropic: "tool:anthropic-claude-code",
    openai: "tool:openai-codex",
    google: "tool:google-gemini-cli",
  }[item.company];
  if (providerTool) ids.push(providerTool);
  return [...new Set(ids)].slice(0, 5);
}

function renderRelatedPanel(item) {
  if (!dom.panelRelatedSection || !dom.panelRelated) return;
  const ids = [...new Set([...relatedIdsForItem(item), ...modelRelatedIdsForItem(item)])];
  const relatedItems = ids
    .map((id) => {
      const direct = state.items.find((candidate) => candidate.id === id);
      if (direct) return direct;
      const workflow = state.workflows.find((candidate) => candidate.id === id);
      if (workflow) return workflow;
      const company = relatedModelCompanyForId(id);
      if (!company) return null;
      const catalogModel = state.modelCatalog?.find((candidate) => candidate.company === company);
      if (!catalogModel) return null;
      return {
        ...catalogModel,
        type: "model",
        _surface: "models",
        _catalogOnly: true,
      };
    })
    .filter(Boolean);
  dom.panelRelated.replaceChildren();
  dom.panelRelatedSection.hidden = !relatedItems.length;
  for (const related of relatedItems) {
    const button = createElement("button", "panel-related-item");
    button.type = "button";
    button.dataset.relatedId = related.id;
    const surface = related.type === "workflow" || related.verification_status ? "workflows" : related._surface;
    const type = localizedText(SURFACES[surface]?.label, state.currentLang === "zh" ? "内容" : "Content");
    button.append(
      createElement("span", "panel-related-type", type),
      createElement("strong", "", localizedText(related.title, related.id)),
      createElement("span", "panel-related-summary", localizedText(related.summary, related.goal || "")),
    );
    dom.panelRelated.append(button);
  }
}

function renderPanel(item) {
  if (!item) return;
  dom.panelSave.hidden = false;
  const effectiveSurface = effectiveSurfaceForItem(item);
  const surface = SURFACES[effectiveSurface] || SURFACES.knowledge;
  const modelCompany = effectiveSurface === "models" ? modelCompanyForItem(item) : null;
  const title = localizedText(item.title, item.id);
  const summary = localizedText(item.summary);
  const domain = localizedText(item.domain);
  const categoryLabels = categoryLabelsForItem(item);
  const tags = localized(item.tags, []);
  const next = localized(item.next, []);
  const sources = localized(item.sources, []);
  const logo = modelCompany
    ? { name: localizedText(modelCompany.label), src: modelCompany.logo }
    : MODEL_LOGOS[item.id];

  dom.panelVisual.dataset.surface = effectiveSurface;
  dom.detailPanel.dataset.surface = effectiveSurface;
  dom.panelType.textContent = effectiveSurface === "agents"
    ? (item._resourceType === "mcp" ? "MCP" : "SKILL")
    : surface.short;
  dom.panelId.textContent = item.modelId || item.id;
  dom.panelTitle.textContent = title;
  dom.panelSummary.textContent = summary;
  const decision = panelDecisionValues(item, effectiveSurface, Array.isArray(tags) ? tags : [tags], categoryLabels);
  dom.panelDecisionUseLabel.textContent = decision.labels.use;
  dom.panelDecisionTypeLabel.textContent = decision.labels.type;
  dom.panelDecisionUpdatedLabel.textContent = decision.labels.updated;
  dom.panelDecisionUse.textContent = decision.use;
  dom.panelDecisionType.textContent = decision.type;
  dom.panelDecisionUpdated.textContent = decision.updated;
  const panelDomain = modelCompany
    ? `${localizedText(item.provider, localizedText(modelCompany.label))} · ${domain}`
    : categoryLabels.length
      ? categoryLabels.join(" · ")
      : domain;
  dom.panelDomain.textContent = panelDomain || "--";
  dom.panelDomainRow.hidden = !panelDomain;
  dom.panelUpdated.textContent = item.updated || "--";
  dom.panelMonogram.textContent = title.slice(0, 2).toUpperCase();
  dom.panelLogo.hidden = !logo;
  if (logo) {
    dom.panelLogo.src = logo.src;
    dom.panelLogo.alt = logo.name;
  } else {
    dom.panelLogo.removeAttribute("src");
    dom.panelLogo.alt = "";
  }

  const firstSourceUrl = renderSources(sources);
  const showPrimarySource = Boolean(firstSourceUrl);
  dom.panelSourceLink.hidden = !showPrimarySource;
  if (showPrimarySource) dom.panelSourceLink.href = firstSourceUrl;
  else dom.panelSourceLink.removeAttribute("href");
  renderList(dom.panelNext, next, translate("noNext"));
  dom.panelTags.replaceChildren();
  if (tags.length) {
    for (const tag of tags) dom.panelTags.append(createElement("span", "panel-tag", String(tag)));
  } else {
    dom.panelTags.append(createElement("span", "panel-empty", translate("noTags")));
  }
  renderPanelContent(item);
  renderRelatedPanel(item);
  const panelScroll = dom.detailPanel.querySelector(".panel-scroll");
  if (panelScroll) panelScroll.scrollTop = 0;
  const isFavorite = state.favorites.has(item.id);
  dom.panelSave.setAttribute("aria-pressed", String(isFavorite));
  dom.panelSave.setAttribute("aria-label", isFavorite ? translate("unfavorite") : translate("favorite"));
}

function workflowContentText(workflow) {
  if (!workflow) return "";
  const section = (title, values) => (
    Array.isArray(values) && values.length ? `${title}\n${values.join("\n")}` : ""
  );
  const lines = [
    workflow.title,
    workflow.summary,
    workflow.walkthrough?.scenario || workflow.goal,
    workflow.walkthrough?.result || "",
    workflow.verification_status === "researching" || workflow.tutorial_kind === "method-guide"
      ? workflowEvidenceSummary(workflow) : "",
    section("开始之前", workflow.required_inputs),
    section("操作前先确认", workflow.prerequisites),
    section("参考模型", workflowReferenceLabels(workflow.model_ids)),
    section("关联工具", workflowReferenceLabels(workflow.tool_ids)),
    section("时间与成本", [workflow.time_estimate, workflow.cost_estimate].filter(Boolean)),
    section("替代路径", workflow.alternatives),
    ...(workflow.steps || []).map((step) => [
      `${step.order}. ${step.title}`,
      step.instructions,
      ...(step.prepare || []),
      step.prompt || "",
      ...(step.do_this || []),
      step.diagram?.kind === "image" ? `${step.diagram.caption || ""}\n${step.diagram.attribution || ""}` : "",
      step.you_should_see,
      step.expected_output !== step.you_should_see ? step.expected_output : "",
      ...(step.if_it_goes_wrong || []),
    ].filter(Boolean).join("\n\n")),
    section("整篇做不下去时", workflow.failure_paths),
    ...(workflow.source_records || []).map((source) => `${source.title} · ${source.author || ""}\n${source.url}`),
    workflow.walkthrough?.starter_file || "",
  ];
  return lines.filter(Boolean).join("\n\n");
}

function workflowEvidenceSummary(workflow) {
  if (workflow.verification_status === "researching") {
    return state.currentLang === "zh" ? "来源与步骤仍在复核，尚未实测。" : "Sources and steps are under review; no reproduced run.";
  }
  const summaries = {
    "local-result": {
      zh: "本地文件与结果已检查；软件操作录像和真人试走尚未完成。",
      en: "Local files and outputs checked; native-app recording and beginner trial remain unverified.",
    },
    "source-tutorial": {
      zh: "按原教程整理；软件操作未在本站重新运行，图中来源与结果分别标明。",
      en: "Based on the source tutorial; software steps not rerun here. Figures identify their origin.",
    },
    "case-analysis": {
      zh: "原案例对照，不调用模型，也不作为软件操作实测。",
      en: "Source-case analysis, without a model call or reproduced software session.",
    },
    "method-guide": {
      zh: "操作方案，尚无完整的同工具实测记录。",
      en: "Task plan, without a complete reproduced run in the named tool.",
    },
  };
  return localizedText(summaries[workflow.tutorial_kind || "method-guide"]);
}

function appendWorkflowSection(container, title, values) {
  if (!Array.isArray(values) || !values.length) return;
  const section = createElement("section", "workflow-panel-section");
  section.append(createElement("h3", "workflow-panel-section-title", title));
  const list = document.createElement("ul");
  for (const value of values) list.append(createElement("li", "", String(value)));
  section.append(list);
  container.append(section);
}

function workflowReferenceLabels(ids) {
  const records = [
    ...(Array.isArray(state.items) ? state.items : []),
    ...(Array.isArray(state.modelCatalog) ? state.modelCatalog : []),
  ];
  const legacyAliases = {
    "model:openai-gpt": "OpenAI GPT 系列（具体版本按当前可用模型）",
    "model:anthropic-claude": "Claude 系列（具体版本按当前可用模型）",
    "model:google-gemini": "Gemini 系列（具体版本按当前可用模型）",
  };
  return (Array.isArray(ids) ? ids : []).map((id) => {
    const normalizedId = String(id || "");
    if (/\bterra\b/i.test(normalizedId)) return "";
    const record = records.find((candidate) => (
      !isExcludedModelRecord(candidate)
      && (
      candidate?.id === normalizedId
      || candidate?.id === normalizedId.replace(/^model:/u, "")
      || `model:${candidate?.id}` === normalizedId
      )
    ));
    return localizedText(record?.title, legacyAliases[normalizedId] || "");
  }).filter(Boolean);
}

const DIAGRAM_NS = "http://www.w3.org/2000/svg";

function diagramNode(tag, attributes = {}) {
  const node = document.createElementNS(DIAGRAM_NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}

function diagramLabel(x, y, text, anchor = "middle") {
  const label = diagramNode("text", {
    x,
    y,
    "text-anchor": anchor,
    "dominant-baseline": "middle",
    class: "workflow-diagram-label",
  });
  label.textContent = String(text).slice(0, 14);
  return label;
}

function buildWorkflowDiagram(diagram) {
  if (!diagram) return null;
  const requiresItems = diagram.kind !== "image";
  if (requiresItems && (!Array.isArray(diagram.items) || !diagram.items.length)) return null;
  const items = Array.isArray(diagram.items)
    ? diagram.items.slice(0, 5).map((item) => String(item))
    : [];
  const figure = createElement("figure", "workflow-diagram");
  figure.dataset.kind = diagram.kind;

  if (diagram.caption) {
    figure.append(createElement("figcaption", "workflow-diagram-caption", String(diagram.caption)));
  }

  if (diagram.kind === "image") {
    if (!diagram.image) return null;
    const media = createElement("a", "workflow-diagram-media");
    media.href = String(diagram.image);
    media.target = "_blank";
    media.rel = "noopener";
    media.title = state.currentLang === "zh" ? "查看原图" : "View full image";
    media.setAttribute("aria-label", `${media.title}: ${diagram.image_alt || diagram.caption || ""}`);
    const image = document.createElement("img");
    if (Number.isInteger(diagram.width) && diagram.width > 0 && Number.isInteger(diagram.height) && diagram.height > 0) {
      image.width = diagram.width;
      image.height = diagram.height;
    }
    image.src = String(diagram.image);
    image.alt = String(diagram.image_alt || diagram.caption || "");
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);
    figure.append(media);
    if (diagram.attribution) {
      figure.append(createElement("span", "workflow-diagram-credit", String(diagram.attribution)));
    }
    return figure;
  }

  if (diagram.kind === "flow") {
    const width = 120 + items.length * 132;
    const svg = diagramNode("svg", {
      viewBox: `0 0 ${width} 96`,
      role: "img",
      "aria-label": diagram.caption || items.join(" → "),
    });
    svg.setAttribute("class", "workflow-diagram-svg");
    items.forEach((item, index) => {
      const x = 16 + index * 132;
      svg.append(diagramNode("rect", { x, y: 18, width: 104, height: 56, rx: 10, class: "workflow-diagram-node" }));
      svg.append(diagramLabel(x + 52, 46, item));
      if (index < items.length - 1) {
        svg.append(diagramNode("path", {
          d: `M${x + 108} 46 H${x + 126}`,
          class: "workflow-diagram-arrow",
        }));
        svg.append(diagramNode("path", {
          d: `M${x + 120} 41 L${x + 127} 46 L${x + 120} 51`,
          class: "workflow-diagram-arrow",
        }));
      }
    });
    figure.append(svg);
    return figure;
  }

  if (diagram.kind === "layers") {
    const height = 30 + items.length * 42;
    const svg = diagramNode("svg", {
      viewBox: `0 0 260 ${height}`,
      role: "img",
      "aria-label": diagram.caption || items.join(" / "),
    });
    svg.setAttribute("class", "workflow-diagram-svg");
    items.forEach((item, index) => {
      const y = 14 + (items.length - 1 - index) * 42;
      svg.append(diagramNode("rect", { x: 30 + index * 8, y, width: 200 - index * 16, height: 32, rx: 8, class: "workflow-diagram-node" }));
      svg.append(diagramLabel(130, y + 16, item));
    });
    figure.append(svg);
    return figure;
  }

  if (diagram.kind === "compare") {
    const svg = diagramNode("svg", {
      viewBox: "0 0 320 110",
      role: "img",
      "aria-label": diagram.caption || items.join(" vs "),
    });
    svg.setAttribute("class", "workflow-diagram-svg");
    const half = Math.ceil(items.length / 2);
    const columns = [items.slice(0, half), items.slice(half)];
    columns.forEach((column, columnIndex) => {
      const x = columnIndex === 0 ? 12 : 172;
      svg.append(diagramNode("rect", { x, y: 12, width: 136, height: 86, rx: 10, class: "workflow-diagram-panel" }));
      column.forEach((item, rowIndex) => {
        svg.append(diagramLabel(x + 68, 36 + rowIndex * 26, item));
      });
    });
    figure.append(svg);
    return figure;
  }

  const list = createElement("ol", "workflow-diagram-checklist");
  for (const item of items) list.append(createElement("li", "", item));
  figure.append(list);
  return figure;
}

function renderWorkflowPanel(workflow) {
  if (!workflow) return;
  const category = workflowCategoryLabel(workflow.category);
  const title = workflow.title || workflow.id;
  const sources = Array.isArray(workflow.source_records) ? workflow.source_records : [];
  state.panelRawContent = workflowContentText(workflow);
  dom.panelVisual.dataset.surface = "workflow";
  dom.detailPanel.dataset.surface = "workflow";
  dom.panelType.textContent = "WORKFLOW";
  dom.panelId.textContent = workflow.id;
  dom.panelTitle.textContent = title;
  dom.panelSummary.textContent = workflow.summary || "";
  dom.panelDecisionUseLabel.textContent = state.currentLang === "zh" ? "解决" : "Solves";
  dom.panelDecisionTypeLabel.textContent = state.currentLang === "zh" ? "难度" : "Level";
  dom.panelDecisionUpdatedLabel.textContent = state.currentLang === "zh" ? "验证" : "Verified";
  dom.panelDecisionUse.textContent = category;
  dom.panelDecisionType.textContent = workflowDifficultyLabel(workflow.difficulty);
  dom.panelDecisionUpdated.textContent = workflowStatusLabel(workflow.verification_status);
  dom.panelDomain.textContent = category;
  dom.panelDomainRow.hidden = false;
  dom.panelUpdated.textContent = workflow.last_verified || "--";
  dom.panelMonogram.textContent = "WF";
  dom.panelLogo.hidden = true;
  dom.panelLogo.removeAttribute("src");
  dom.panelLogo.alt = "";
  dom.panelSave.hidden = false;
  const isFavorite = state.favorites.has(workflow.id);
  dom.panelSave.setAttribute("aria-pressed", String(isFavorite));
  dom.panelSave.setAttribute("aria-label", isFavorite ? translate("unfavorite") : translate("favorite"));
  dom.panelRelated.replaceChildren();
  dom.panelRelatedSection.hidden = true;
  dom.panelSourceLink.hidden = !sources[0]?.url;
  if (sources[0]?.url) dom.panelSourceLink.href = sources[0].url;
  else dom.panelSourceLink.removeAttribute("href");
  renderList(dom.panelNext, workflow.expected_artifacts, state.currentLang === "zh" ? "暂无最终产物" : "No expected artifacts listed");
  dom.panelTags.replaceChildren();
  for (const label of [category, workflowDifficultyLabel(workflow.difficulty), workflowStatusLabel(workflow.verification_status)]) {
    dom.panelTags.append(createElement("span", "panel-tag", label));
  }
  dom.panelContent.replaceChildren();
  const intro = createElement("div", "workflow-article-intro");
  intro.dataset.tutorialKind = workflow.tutorial_kind || "researching";
  intro.append(createElement("p", "", workflow.walkthrough?.scenario || workflow.goal || ""));
  if (workflow.walkthrough?.result) intro.append(createElement("p", "", workflow.walkthrough.result));
  if (workflow.verification_status === "researching" || workflow.tutorial_kind === "method-guide") {
    intro.append(createElement("p", "workflow-evidence-scope", workflowEvidenceSummary(workflow)));
  }
  if (workflow.walkthrough?.starter_file && !workflow.walkthrough.starter_file.endsWith(".zip")) {
    const link = document.createElement("a");
    link.className = "workflow-starter-link";
    link.href = workflow.walkthrough.starter_file;
    const isWorkflowJson = workflow.walkthrough.starter_file.endsWith(".json");
    link.download = isWorkflowJson ? "text-to-image.json" : "index.html";
    link.textContent = state.currentLang === "zh"
      ? (isWorkflowJson ? "下载示例工作流" : "下载示例页面")
      : (isWorkflowJson ? "Download example workflow" : "Download example page");
    intro.append(link);
  }
  dom.panelContent.append(intro);
  appendWorkflowSection(dom.panelContent, state.currentLang === "zh" ? "开始之前" : "Before you start", workflow.required_inputs);
  appendWorkflowSection(dom.panelContent, state.currentLang === "zh" ? "操作前先确认" : "Before you begin", workflow.prerequisites);
  const context = createElement("details", "workflow-context");
  context.append(createElement("summary", "", state.currentLang === "zh" ? "工具、成本与替代路径" : "Tools, cost and alternatives"));
  appendWorkflowSection(
    context,
    state.currentLang === "zh" ? "参考模型" : "Related models",
    workflowReferenceLabels(workflow.model_ids),
  );
  appendWorkflowSection(
    context,
    state.currentLang === "zh" ? "关联工具" : "Related tools",
    workflowReferenceLabels(workflow.tool_ids),
  );
  appendWorkflowSection(
    context,
    state.currentLang === "zh" ? "时间与成本" : "Time and cost",
    [
      workflow.time_estimate ? `${state.currentLang === "zh" ? "预计时间" : "Time"}：${workflow.time_estimate}` : "",
      workflow.cost_estimate ? `${state.currentLang === "zh" ? "成本边界" : "Cost"}：${workflow.cost_estimate}` : "",
    ].filter(Boolean),
  );
  appendWorkflowSection(
    context,
    state.currentLang === "zh" ? "做不通时的替代路径" : "Alternatives",
    workflow.alternatives,
  );
  if (context.children.length > 1) dom.panelContent.append(context);
  if (Array.isArray(workflow.steps) && workflow.steps.length) {
    const steps = createElement("section", "workflow-panel-section");
    const list = document.createElement("ol");
    list.className = "workflow-step-list";
    for (const step of workflow.steps) {
      const item = createElement("li", "workflow-step");
      item.append(createElement("h3", "workflow-step-title", `${step.order}. ${step.title}`));
      item.append(createElement("p", "workflow-step-instruction", step.instructions));
      const prepare = Array.isArray(step.prepare) ? step.prepare : [];
      if (prepare.length) {
        item.append(createElement("p", "", prepare.join("；")));
      }
      if (step.prompt) {
        const block = createElement("div", "workflow-prompt");
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = step.prompt;
        pre.append(code);
        const copy = createElement("button", "icon-button workflow-prompt-copy");
        copy.type = "button";
        copy.title = state.currentLang === "zh" ? "复制这段内容" : "Copy this text";
        copy.setAttribute("aria-label", copy.title);
        copy.append(createIcon("copy"));
        let feedbackTimer = null;
        const showCopyFeedback = (succeeded) => {
          const message = translate(succeeded ? "copied" : "copyFailed");
          copy.dataset.copyState = succeeded ? "success" : "failure";
          copy.title = message;
          copy.setAttribute("aria-label", message);
          copy.replaceChildren(createIcon(succeeded ? "check" : "x"));
          feedbackTimer = window.setTimeout(() => {
            delete copy.dataset.copyState;
            copy.title = state.currentLang === "zh" ? "复制这段内容" : "Copy this text";
            copy.setAttribute("aria-label", copy.title);
            copy.replaceChildren(createIcon("copy"));
          }, 1800);
        };
        copy.addEventListener("click", async () => {
          window.clearTimeout(feedbackTimer);
          copy.disabled = true;
          copy.setAttribute("aria-busy", "true");
          try {
            await writeClipboardText(step.prompt);
            if (copy.isConnected) showCopyFeedback(true);
          } catch {
            if (copy.isConnected) showCopyFeedback(false);
          } finally {
            copy.disabled = false;
            copy.removeAttribute("aria-busy");
          }
        });
        block.append(pre, copy);
        item.append(block);
      }
      const doThis = Array.isArray(step.do_this) ? step.do_this : [];
      if (doThis.length) {
        const actions = createElement("ol", "workflow-actions");
        for (const value of doThis) actions.append(createElement("li", "", String(value)));
        item.append(actions);
      }
      if (step.diagram) {
        const figure = buildWorkflowDiagram(step.diagram);
        if (figure) item.append(figure);
      }
      if (step.you_should_see) {
        item.append(createElement("p", "workflow-result", step.you_should_see));
      }
      if (step.expected_output && step.expected_output !== step.you_should_see) {
        item.append(createElement(
          "p",
          step.you_should_see ? "workflow-step-output" : "workflow-result",
          `${state.currentLang === "zh" ? "完成标准" : "Done when"}：${step.expected_output}`,
        ));
      }
      const wrong = Array.isArray(step.if_it_goes_wrong) ? step.if_it_goes_wrong : [];
      if (wrong.length) {
        const block = createElement("details", "workflow-troubleshooting");
        block.append(createElement("summary", "", state.currentLang === "zh" ? "这一步没成功？" : "Something went wrong?"));
        const ul = document.createElement("ul");
        for (const value of wrong) ul.append(createElement("li", "", String(value)));
        block.append(ul);
        item.append(block);
      }
      list.append(item);
    }
    steps.append(list);
    dom.panelContent.append(steps);
  }
  if (Array.isArray(workflow.failure_paths) && workflow.failure_paths.length) {
    const recovery = createElement("details", "workflow-troubleshooting workflow-final-troubleshooting");
    recovery.append(createElement("summary", "", state.currentLang === "zh" ? "整篇做不下去时怎么办？" : "What if the whole tutorial gets stuck?"));
    const list = document.createElement("ul");
    workflow.failure_paths.forEach((value) => list.append(createElement("li", "", String(value))));
    recovery.append(list);
    dom.panelContent.append(recovery);
  }
  renderSources(sources.map((source) => ({ title: source.title, url: source.url })));
  const panelScroll = dom.detailPanel.querySelector(".panel-scroll");
  if (panelScroll) panelScroll.scrollTop = 0;
}

function openWorkflow(id, trigger = null) {
  const workflow = state.workflows.find((candidate) => candidate.id === id);
  if (!workflow) return;
  state.selectedWorkflowId = id;
  state.selectedId = null;
  trackRecentItem(id);
  state.lastTrigger = trigger;
  renderWorkflowPanel(workflow);
  dom.detailPanel.removeAttribute("inert");
  dom.detailPanel.setAttribute("aria-hidden", "false");
  dom.panelBackdrop.hidden = false;
  document.body.classList.add("panel-open");
  window.requestAnimationFrame(() => {
    dom.detailPanel.classList.add("open");
    dom.panelClose.focus({ preventScroll: true });
  });
}

function openPanel(id, trigger = null) {
  const item = state.items.find((candidate) => candidate.id === id)
    || (state.modelCatalog || []).find((candidate) => candidate.id === id);
  if (!item) return;
  const normalizedItem = item._surface ? item : { ...item, _surface: "models", _surfaces: ["models"] };
  state.selectedWorkflowId = null;
  state.selectedId = id;
  trackRecentItem(id);
  state.lastTrigger = trigger;
  const contentPromise = state.contentStatus === "loaded" ? null : loadContentMap();
  renderPanel(normalizedItem);
  renderCards();
  dom.detailPanel.removeAttribute("inert");
  dom.detailPanel.setAttribute("aria-hidden", "false");
  dom.panelBackdrop.hidden = false;
  document.body.classList.add("panel-open");
  window.requestAnimationFrame(() => {
    dom.detailPanel.classList.add("open");
    dom.panelClose.focus({ preventScroll: true });
  });
  contentPromise?.then(() => {
    if (state.selectedId === id) renderPanel(normalizedItem);
  });
}

function trackRecentItem(id) {
  if (!id) return;
  const next = [id, ...state.recentItems.filter((itemId) => itemId !== id)].slice(0, 12);
  if (persistWorkspacePatch({ [STORAGE_KEYS.recent]: JSON.stringify(next) })) state.recentItems = next;
}

function exportLocalWorkspace() {
  const payload = {
    schema_version: "local-workspace.v1",
    exported_at: new Date().toISOString(),
    favorites: [...state.favorites],
    recent: [...state.recentItems],
  };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "knowledge-cosmos-local-workspace.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function importLocalWorkspace(file) {
  if (!file || state.workspaceImportPending) return;
  if (file.size > 1024 * 1024) {
    showWorkspaceMessage("workspaceImportSizeError");
    return;
  }
  state.workspaceImportPending = true;
  renderCards();
  try {
    const payload = JSON.parse(await file.text());
    if (payload?.schema_version !== "local-workspace.v1") {
      showWorkspaceMessage("workspaceImportVersionError");
      return;
    }
    const fields = ["schema_version", "exported_at", "favorites", "recent"];
    if (typeof payload !== "object" || Array.isArray(payload)
      || Object.keys(payload).some((key) => !fields.includes(key))
      || typeof payload.exported_at !== "string"
      || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/u.test(payload.exported_at)
      || Number.isNaN(Date.parse(payload.exported_at))
      || !validWorkspaceIds(payload.favorites) || !validWorkspaceIds(payload.recent, 12)) {
      throw new Error("Invalid backup");
    }
    if (state.workspaceReadErrors.size && !window.confirm(translate("workspaceReplaceUnreadableConfirm"))) return;
    const favorites = new Set([...state.favorites, ...payload.favorites]);
    if (favorites.size > 5000) throw new Error("Too many saved IDs");
    const recent = [...new Set([...state.recentItems, ...payload.recent])].slice(0, 12);
    if (!persistWorkspacePatch({
      [STORAGE_KEYS.favorites]: JSON.stringify([...favorites]),
      [STORAGE_KEYS.recent]: JSON.stringify(recent),
    }, { replaceUnreadable: true })) return;
    state.favorites = favorites;
    state.recentItems = recent;
    showWorkspaceMessage("workspaceImportSuccess", true);
  } catch {
    showWorkspaceMessage("workspaceImportError");
  } finally {
    state.workspaceImportPending = false;
    renderCards();
  }
}

function clearRecentWorkspace() {
  if (state.workspaceImportPending || !window.confirm(translate("workspaceClearRecentConfirm"))) return;
  if (!persistWorkspacePatch({ [STORAGE_KEYS.recent]: "[]" }, { replaceUnreadable: true })) return;
  state.recentItems = [];
  renderAll();
}

function clearLocalWorkspace() {
  if (state.workspaceImportPending || !window.confirm(translate("workspaceClearAllConfirm"))) return;
  if (!persistWorkspacePatch({
    [STORAGE_KEYS.favorites]: "[]",
    [STORAGE_KEYS.recent]: "[]",
  }, { replaceUnreadable: true })) return;
  state.favorites = new Set();
  state.recentItems = [];
  renderAll();
}

function closePanel({ restoreFocus = true } = {}) {
  if (!dom.detailPanel || !dom.detailPanel.classList.contains("open")) return;
  const selectedId = state.selectedId;
  const selectedWorkflowId = state.selectedWorkflowId;
  const trigger = state.lastTrigger;
  dom.detailPanel.classList.remove("open");
  dom.detailPanel.setAttribute("aria-hidden", "true");
  dom.detailPanel.setAttribute("inert", "");
  dom.panelBackdrop.hidden = true;
  document.body.classList.remove("panel-open");
  document.querySelectorAll(".card.is-selected").forEach((card) => card.classList.remove("is-selected"));
  state.selectedId = null;
  state.selectedWorkflowId = null;
  state.lastTrigger = null;
  if (!restoreFocus) return;

  const focusTarget = trigger?.isConnected
    ? trigger
    : selectedWorkflowId
      ? [...dom.workflowGrid.querySelectorAll('[data-action="open-workflow"]')].find((button) => button.dataset.id === selectedWorkflowId)
    : [...dom.contentGrid.querySelectorAll('[data-action="open"]')]
      .find((button) => button.dataset.id === selectedId);
  focusTarget?.focus({ preventScroll: true });
}

async function copyPanelContent() {
  const selectedWorkflowId = state.selectedWorkflowId;
  const selectedId = state.selectedId;
  const isCurrent = () => state.selectedWorkflowId === selectedWorkflowId && state.selectedId === selectedId;
  if (selectedWorkflowId) {
    const workflow = state.workflows.find((candidate) => candidate.id === selectedWorkflowId);
    const text = workflowContentText(workflow);
    if (!text) return;
    try {
      await writeClipboardText(text);
      if (!isCurrent()) return;
      dom.copyContent.querySelector("span").textContent = translate("copied");
      window.setTimeout(() => {
        if (isCurrent() && dom.copyContent.isConnected) dom.copyContent.querySelector("span").textContent = translate("copyContent");
      }, 1400);
    } catch {
      if (isCurrent()) dom.copyContent.querySelector("span").textContent = translate("copyFailed");
    }
    return;
  }
  if (!selectedId) return;
  if (selectedId.startsWith("prompt:") && state.structuredDetailFailed && state.contentStatus === "loaded") {
    state.contentStatus = "idle";
  }
  if (state.contentStatus !== "loaded") await loadContentMap();
  if (!isCurrent()) return;
  const item = state.items.find((candidate) => candidate.id === selectedId);
  if (item?.id.startsWith("prompt:") && !state.promptBodies[item.id]) {
    dom.copyContent.querySelector("span").textContent = translate("copyFailed");
    return;
  }
  const text = itemContentText(item) || state.panelRawContent || dom.panelSummary.textContent || "";
  if (!text) return;
  try {
    await writeClipboardText(text);
    if (!isCurrent()) return;
    dom.copyContent.querySelector("span").textContent = translate("copied");
    window.setTimeout(() => {
      if (isCurrent() && dom.copyContent.isConnected) dom.copyContent.querySelector("span").textContent = translate("copyContent");
    }, 1400);
  } catch {
    if (isCurrent()) dom.copyContent.querySelector("span").textContent = translate("copyFailed");
  }
}

function showLoadError(detail = "") {
  dom.loadingOverlay.classList.add("is-error");
  dom.loadingOverlay.setAttribute("role", "alert");
  dom.loadingOverlay.setAttribute("aria-busy", "false");
  dom.loadingTitle.textContent = translate("loadError");
  dom.loadingOverlay.querySelectorAll("button, .loading-detail").forEach((element) => element.remove());
  if (detail) dom.loadingOverlay.append(createElement("small", "loading-detail", String(detail).slice(0, 160)));
  const retry = createElement("button", "secondary-button", translate("retry"));
  retry.type = "button";
  retry.addEventListener("click", () => {
    dom.loadingOverlay.classList.remove("is-error");
    dom.loadingOverlay.setAttribute("role", "status");
    dom.loadingOverlay.setAttribute("aria-busy", "true");
    dom.loadingTitle.textContent = translate("indexLoading");
    dom.loadingOverlay.querySelectorAll(".loading-detail").forEach((element) => element.remove());
    loadData();
  }, { once: true });
  dom.loadingOverlay.append(retry);
}

window.__kcPending = window.__kcPending || new Set();
function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const name = String(url).replace(/^\.\//, "").split("?")[0];
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  window.__kcPending.add(name);
  return fetch(url, controller ? { ...options, signal: controller.signal } : options)
    .catch((error) => {
      throw new Error(`${name}: ${error?.name === "AbortError" ? "timeout" : (error?.message || "network error")}`);
    })
    .finally(() => {
      if (timer) clearTimeout(timer);
      window.__kcPending.delete(name);
    });
}

async function loadData() {
  if (state.loadPromise) return state.loadPromise;
  state.loadPromise = (async () => {
    try {
      // Fire every request at once: total wait is the slowest file, not the sum.
      const optionalJson = (name, timeout) => fetchWithTimeout(`./${name}?v=${DATA_VERSION}`, { cache: "default" }, timeout)
        .then((response) => response.ok ? response.json() : null);
      const itemsRequest = fetchWithTimeout(`./data.json?v=${DATA_VERSION}`, { cache: "default" }, 45000);
      const optionalRequests = Promise.allSettled([
        optionalJson("model-catalog.json"),
        optionalJson("artificial-analysis-snapshot.json"),
        optionalJson("media-model-leaderboards-snapshot.json"),
        optionalJson("skill-leaderboard-snapshot.json"),
        optionalJson("workflows.json"),
        optionalJson("content-index.generated.json", 45000),
        optionalJson("leaderboards.json"),
        optionalJson("lab-experiments.json"),
      ]);
      const itemsResponse = await itemsRequest;
      if (!itemsResponse.ok) throw new Error("Failed to load index data");
      const rawItems = await itemsResponse.json();
      let modelItems = rawItems.filter((item) => item?.view === "models" && !/\bterra\b/i.test(`${localizedText(item.title)} ${item.id || ""} ${item.modelId || ""}`));
      const optionalResources = await optionalRequests;
      // research-content / lab-experiments / workflow-research-queue are empty and no longer fetched.
      const researchContent = null;
      const labExperiments = null; // lab entries render in their own board, not as library cards
      const workflowQueue = null;
      const [modelCatalog, artificialAnalysis, mediaModelLeaderboards, skillLeaderboard, workflowBundle, generatedContent, leaderboardBrief, labExperimentsFile] = optionalResources.map((result) => (
        result.status === "fulfilled" ? result.value : null
      ));
      if (generatedContent?.schema_version !== "content.front.v1"
        || !Array.isArray(generatedContent.items) || !generatedContent.items.length
        || generatedContent.count !== generatedContent.items.length
        || !Array.isArray(generatedContent.blocked_legacy)
        || generatedContent.blocked_legacy.some((value) => typeof value !== "string" || !value.trim())) {
        // Never blank the site because the generated index failed to load on a
        // slow network: fall back to the directory index in data.json.
        console.warn("content-index unavailable; falling back to data.json only");
      }
      if (Array.isArray(modelCatalog) && modelCatalog.length) {
        modelItems = modelCatalog.filter((item) => !isExcludedModelRecord(item));
      }
      const generatedItems = Array.isArray(generatedContent?.items)
        ? generatedContent.items.filter((item) => item?.type !== "model" && item.status === "published" && item.access === "public")
        : [];
      const blockedLegacy = new Set((generatedContent?.blocked_legacy || []).map((value) => normalizeText(value)));
      const generatedIds = new Set(generatedItems.map((item) => item.id));
      const generatedTitles = new Set(generatedItems.map((item) => normalizeText(localizedText(item.title))));
      const legacyNonModels = rawItems.filter((item) => {
        if (item?.view === "models") return false;
        if (generatedIds.has(item?.id)) return false;
        return !generatedTitles.has(normalizeText(localizedText(item?.title)));
      }).filter((item) => {
        const values = [
          item?.id,
          localizedText(item?.title),
          item?.id?.replace(/^[^:]+:/u, ""),
        ].map((value) => normalizeText(value));
        return !values.some((value) => value && blockedLegacy.has(value));
      }).map((item) => ({
        ...item,
        _legacyDirectory: true,
        _sourceBoundary: "directory-index",
      }));
      state.items = prepareItems([
        ...legacyNonModels,
        ...modelItems,
        ...(Array.isArray(researchContent?.items) ? researchContent.items : []),
        ...(Array.isArray(labExperiments) ? labExperiments : []),
        ...generatedItems,
      ]);
      state.blockedLegacy = blockedLegacy;
      state.contentBoundaryReady = true;
      state.artificialAnalysis = artificialAnalysis;
      state.modelCatalog = Array.isArray(modelCatalog) ? modelCatalog : [];
      state.mediaModelLeaderboards = mediaModelLeaderboards;
      state.skillLeaderboard = skillLeaderboard;
      state.labExperiments = Array.isArray(labExperimentsFile) ? labExperimentsFile : [];
      state.leaderboardBrief = leaderboardBrief && leaderboardBrief.schema === "leaderboards.v1" ? leaderboardBrief : null;
      state.researchContent = researchContent;
      const publishedWorkflows = Array.isArray(workflowBundle?.workflows) ? workflowBundle.workflows : [];
      const researchWorkflows = Array.isArray(workflowQueue?.workflows) ? workflowQueue.workflows : [];
      const workflowById = new Map([...publishedWorkflows, ...researchWorkflows].map((workflow) => [workflow.id, workflow]));
      state.workflows = [...workflowById.values()];
      state.workflowStatus = state.workflows.length ? "ready" : "error";
      state.content = {};
      state.contentStatus = "idle";
      renderAll();
      dom.contentGrid.setAttribute("aria-busy", "false");
      dom.loadingOverlay.setAttribute("aria-busy", "false");
      dom.loadingOverlay.hidden = true;
      document.body.classList.remove("is-loading");
    } catch (error) {
      console.error("Knowledge index load failed", error);
      showLoadError(error?.message);
    } finally {
      state.loadPromise = null;
    }
  })();
  return state.loadPromise;
}

function loadContentMap() {
  if (!state.contentBoundaryReady) return Promise.resolve({});
  if (state.contentStatus === "loaded") return Promise.resolve(state.content);
  if (state.contentPromise) return state.contentPromise;

  state.contentStatus = "loading";
  const researchPromise = state.researchContent
    ? Promise.resolve(state.researchContent)
    : fetchWithTimeout(`./research-content.json?v=${DATA_VERSION}`, { cache: "default" })
      .then((response) => response.ok ? response.json() : {})
      .catch(() => ({}));
  state.contentPromise = Promise.allSettled([
    fetchWithTimeout(`./skillcontentmap.json?v=${DATA_VERSION}`, { cache: "default" }).then((response) => response.ok ? response.json() : {}),
    fetchWithTimeout(`./knowledge-content.json?v=${DATA_VERSION}`, { cache: "default" }).then((response) => response.ok ? response.json() : {}),
    fetchWithTimeout(`./content-details.generated.json?v=${DATA_VERSION}`, { cache: "default" }).then((response) => {
      if (!response.ok) throw new Error("Structured detail request failed");
      return response.json();
    }),
    researchPromise,
  ])
    .then(([contentResult, knowledgeResult, generatedResult, researchResult]) => {
      const content = contentResult.status === "fulfilled" ? contentResult.value : {};
      const knowledgeContent = knowledgeResult.status === "fulfilled" ? knowledgeResult.value : {};
      const generatedContent = generatedResult.status === "fulfilled" ? generatedResult.value : {};
      state.structuredDetailFailed = generatedResult.status !== "fulfilled"
        || !generatedContent?.content || typeof generatedContent.content !== "object" || Array.isArray(generatedContent.content);
      const researchContent = researchResult.status === "fulfilled" ? researchResult.value : {};
      const activeIds = new Set([...state.items, ...state.workflows].map((item) => item.id));
      const allowedLegacyDetail = (id) => activeIds.has(id) && ![
        id,
        id.replace(/^[^:]+:/u, ""),
      ].some((value) => state.blockedLegacy.has(normalizeText(value)));
      const gatedLegacyContent = (value) => Object.fromEntries(
        Object.entries(value && typeof value === "object" && !Array.isArray(value) ? value : {})
          .filter(([id]) => allowedLegacyDetail(id)),
      );
      const publicGeneratedDetails = Object.entries(
        generatedContent?.content && typeof generatedContent.content === "object" ? generatedContent.content : {},
      ).filter(([id, detail]) => detail?.status === "published"
        && (detail.body?.access === "public"
          || (detail.type === "model" && !detail.body?.access && id.startsWith("model:")))
        && !state.blockedLegacy.has(normalizeText(id)));
      state.promptBodies = Object.fromEntries(
        publicGeneratedDetails
          .filter(([, detail]) => detail.body?.type === "prompt" && typeof detail.body.prompt_body === "string")
          .map(([id, detail]) => [id, detail.body.prompt_body]),
      );
      const generatedDetailContent = Object.fromEntries(
        publicGeneratedDetails
          .map(([id, detail]) => [id, { zh: contentMarkdownFromRecord(detail?.body), en: contentMarkdownFromRecord(detail?.body) }]),
      );
      state.content = {
        ...gatedLegacyContent(content),
        ...gatedLegacyContent(knowledgeContent),
        ...gatedLegacyContent(researchContent?.content),
        ...generatedDetailContent,
      };
      state.contentStatus = "loaded";
      return state.content;
    })
    .catch((error) => {
      console.error("Knowledge detail content load failed", error);
      state.contentStatus = "error";
      return state.content;
    })
    .finally(() => {
      state.contentPromise = null;
    });
  return state.contentPromise;
}

function contentMarkdownFromRecord(record) {
  if (!record || typeof record !== "object") return "";
  const sections = [];
  const title = localizedText(record.title, record.id || "");
  if (title) sections.push(`# ${title}`);
  if (record.summary) sections.push(localizedText(record.summary));

  if (record.type === "model") {
    sections.push("## 模型信息");
    sections.push(
      [
        `- 提供方：${localizedText(record.provider)}`,
        `- 系列：${localizedText(record.series)}`,
        `- Model ID：\`${record.model_id || "—"}\``,
        `- 类型：${localizedText(record.model_type)}`,
        `- 上下文：${record.context_window || "—"}`,
        `- 适用方向：${localizedText(record.domain)}`,
      ].join("\n"),
    );
  }

  const addList = (heading, values) => {
    const list = Array.isArray(values) ? values.filter(Boolean) : [];
    if (!list.length) return;
    sections.push(`## ${heading}`, ...list.map((value) => `- ${localizedText(value, String(value))}`));
  };

  if (record.goal) sections.push(`## 目标`, localizedText(record.goal));
  addList("适用模型", record.target_models);
  addList("适用场景", record.scenarios);
  addList("你会学到", record.learning_outcomes);
  addList("核心概念", record.concepts);
  addList("适合谁", record.suitable_users);
  addList("解决的问题", record.problem_solved ? [record.problem_solved] : []);
  addList("前置条件", record.prerequisites);
  addList("需要输入", record.required_inputs);
  addList("步骤", (record.steps || []).map((step) => `${step.order || ""}. ${step.title}：${step.instructions}（产出：${step.expected_output}）`));
  addList("预期产物", record.expected_artifacts);
  addList("质量检查", record.quality_checks);
  addList("常见失败", record.known_failures);
  addList("不适用场景", record.non_applicable_scenarios);
  addList("使用说明", record.usage_instructions);
  addList("限制", record.limitations);
  addList("风险", [...(record.privacy_risks || []), ...(record.platform_risks || [])]);
  addList("失败路径", record.failure_paths);
  addList("替代方案", record.alternatives);
  if (record.prompt_body) sections.push(`## Prompt`, record.prompt_body);
  if (record.input_example) sections.push(`## 输入示例`, record.input_example);
  if (record.output_example) sections.push(`## 输出示例`, record.output_example);
  addList("来源", (record.sources || []).map((source) => `${source.title || source.author || "来源"}：${source.url || ""}`));
  return sections.filter(Boolean).join("\n\n");
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const taskAction = event.target.closest("[data-task-action]");
    if (taskAction) {
      activateTaskChannel(taskAction.dataset.taskId, taskAction.dataset.taskAction);
      return;
    }
    const taskPrimary = event.target.closest("[data-task-primary]");
    if (taskPrimary) {
      activateTask(taskPrimary.dataset.taskPrimary);
      return;
    }
    const taskEntry = event.target.closest("[data-task-id]");
    if (taskEntry) {
      activateTask(taskEntry.dataset.taskId);
      return;
    }
    const viewTarget = event.target.closest("[data-view-target]");
    if (viewTarget) {
      switchView(viewTarget.dataset.viewTarget, { force: true, userInitiated: true });
      return;
    }
    if (event.target.closest("#workflowViewAll")) {
      if (state.workflowTaskFilter) {
        state.workflowTaskFilter = null;
        state.workflowExpanded = true;
      } else {
        state.workflowExpanded = !state.workflowExpanded;
      }
      renderWorkflowOverview();
      return;
    }
    const leaderboardTab = event.target.closest("[data-leaderboard-metric]");
    if (leaderboardTab) {
      state.leaderboardMetric = leaderboardTab.dataset.leaderboardMetric || "intelligence";
      renderLeaderboard();
      return;
    }
    const homeLeaderboardTab = event.target.closest("[data-home-leaderboard-category]");
    if (homeLeaderboardTab) {
      state.homeLeaderboardMetric = homeLeaderboardTab.dataset.homeLeaderboardCategory || "text";
      renderHomeLeaderboard();
      return;
    }
    const modelLeaderboardViewTab = event.target.closest("[data-model-leaderboard-view]");
    if (modelLeaderboardViewTab) {
      state.modelLeaderboardView = modelLeaderboardViewTab.dataset.modelLeaderboardView || "models";
      renderLeaderboard();
      return;
    }
    const homeBriefTab = event.target.closest("[data-home-brief-tab]");
    if (homeBriefTab) {
      state.homeBriefTab = homeBriefTab.dataset.homeBriefTab;
      renderHomeLeaderboard();
      return;
    }
    const briefTab = event.target.closest("[data-brief-tab]");
    if (briefTab) {
      state.leaderboardBriefTab = briefTab.dataset.briefTab;
      renderLeaderboard();
      return;
    }
    const modelLeaderboardCategoryTab = event.target.closest("[data-model-leaderboard-category]");
    if (modelLeaderboardCategoryTab) {
      state.modelLeaderboardCategory = modelLeaderboardCategoryTab.dataset.modelLeaderboardCategory || "text";
      renderLeaderboard();
      return;
    }
    const modelLeaderboardSubcategoryTab = event.target.closest("[data-model-leaderboard-subcategory]");
    if (modelLeaderboardSubcategoryTab) {
      const parent = modelLeaderboardSubcategoryTab.dataset.modelLeaderboardParent;
      const subcategory = modelLeaderboardSubcategoryTab.dataset.modelLeaderboardSubcategory;
      if (parent && subcategory) state.modelLeaderboardSubcategories[parent] = subcategory;
      renderLeaderboard();
      return;
    }
    const skillLeaderboardTab = event.target.closest("[data-skill-leaderboard-category]");
    if (skillLeaderboardTab) {
      state.skillLeaderboardCategory = skillLeaderboardTab.dataset.skillLeaderboardCategory || "design";
      renderSkillLeaderboard();
      return;
    }
    const nav = event.target.closest(".nav-item[data-view]");
    if (nav) {
      switchView(nav.dataset.view, { userInitiated: true });
      return;
    }
    const surface = event.target.closest("[data-surface-target]");
    if (surface) {
      switchView(surface.dataset.surfaceTarget, { userInitiated: true });
      return;
    }
    const action = event.target.closest("[data-action]");
    if (action) {
      if (action.dataset.action === "open") openPanel(action.dataset.id, action);
      if (action.dataset.action === "open-workflow") openWorkflow(action.dataset.id, action);
      if (action.dataset.action === "favorite") toggleFavorite(action.dataset.id);
      if (action.dataset.action === "copy-card") copyItemContent(action.dataset.id);
      if (action.dataset.action === "export-local-workspace") exportLocalWorkspace();
      if (action.dataset.action === "import-local-workspace") document.getElementById("workspaceImportFile")?.click();
      if (action.dataset.action === "clear-recent-workspace") clearRecentWorkspace();
      if (action.dataset.action === "clear-local-workspace") clearLocalWorkspace();
      return;
    }
    const glossaryTerm = event.target.closest("[data-glossary-id]");
    if (glossaryTerm) {
      openPanel(glossaryTerm.dataset.glossaryId, glossaryTerm);
      return;
    }
    const related = event.target.closest("[data-related-id]");
    if (related) {
      const id = related.dataset.relatedId;
      const workflow = state.workflows.find((candidate) => candidate.id === id);
      if (workflow) openWorkflow(id, related);
      else openPanel(id, related);
      return;
    }
    if (event.target.closest("#panelClose") || event.target.closest("#panelBackdrop")) {
      closePanel();
      return;
    }
    if (event.target.closest("#panelSave")) {
      toggleFavorite(state.selectedWorkflowId || state.selectedId);
      return;
    }
    if (event.target.closest("#copyContent")) {
      copyPanelContent();
      return;
    }
    const secondaryMode = event.target.closest("[data-secondary-mode]");
    if (secondaryMode) {
      setSecondaryMode(secondaryMode.dataset.secondaryMode);
      return;
    }
    const mode = event.target.closest("[data-mode]");
    if (mode) {
      setMode(mode.dataset.mode);
      return;
    }
    if (event.target.closest("#clearSearch")) {
      resetFilters();
      setSearchExpanded(true, { focus: true });
      return;
    }
    if (event.target.closest("#resetFilters") || event.target.closest("#emptyAction")) {
      if (event.target.closest("#emptyAction") && state.currentView === "my" && !normalizeText(dom.searchInput.value)) {
        switchView("home", { userInitiated: true });
        return;
      }
      resetFilters();
      return;
    }
    if (event.target.closest("#loadMore")) {
      state.visibleCount += pageSizeForView();
      renderCards();
      return;
    }
    if (event.target.closest("#sidebarToggle")) {
      const collapsed = document.body.classList.toggle("sidebar-collapsed");
      writeStorage(STORAGE_KEYS.sidebar, String(collapsed));
      applyTranslations();
    }
  });

  const bindFilterScroller = (tabs, previousButton, nextButton, selectMode) => {
    let drag = null;
    let suppressClick = false;

    tabs.addEventListener("click", (event) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, { capture: true });

    tabs.addEventListener("wheel", (event) => {
      const maxScroll = tabs.scrollWidth - tabs.clientWidth;
      if (maxScroll <= 0) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const nextScroll = Math.max(0, Math.min(maxScroll, tabs.scrollLeft + delta));
      if (nextScroll === tabs.scrollLeft) return;
      event.preventDefault();
      tabs.scrollLeft = nextScroll;
      updateTabScrollAffordance();
    }, { passive: false });

    tabs.addEventListener("scroll", updateTabScrollAffordance, { passive: true });
    previousButton.addEventListener("click", () => scrollModeTabs(tabs, -1));
    nextButton.addEventListener("click", () => scrollModeTabs(tabs, 1));

    tabs.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag = { pointerId: event.pointerId, startX: event.clientX, startScroll: tabs.scrollLeft, moved: false };
    });

    tabs.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const distance = event.clientX - drag.startX;
      if (!drag.moved && Math.abs(distance) < 4) return;
      if (!drag.moved) {
        drag.moved = true;
        tabs.setPointerCapture(event.pointerId);
        tabs.classList.add("is-dragging");
      }
      event.preventDefault();
      tabs.scrollLeft = drag.startScroll - distance;
      updateTabScrollAffordance();
    });

    const finishDrag = (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      suppressClick = drag.moved;
      if (tabs.hasPointerCapture(event.pointerId)) tabs.releasePointerCapture(event.pointerId);
      tabs.classList.remove("is-dragging");
      drag = null;
      if (suppressClick) window.setTimeout(() => { suppressClick = false; }, 0);
    };

    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    tabs.addEventListener("keydown", (event) => {
      const focusedTab = event.target.closest(".mode-tab");
      if (["Enter", " "].includes(event.key) && focusedTab) {
        event.preventDefault();
        selectMode(focusedTab.dataset.mode || focusedTab.dataset.secondaryMode);
        return;
      }
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      const availableTabs = [...tabs.querySelectorAll(".mode-tab:not(:disabled)")];
      const currentIndex = availableTabs.indexOf(document.activeElement);
      if (currentIndex < 0) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextTab = availableTabs[(currentIndex + direction + availableTabs.length) % availableTabs.length];
      nextTab.focus();
      nextTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    });
  };

  bindFilterScroller(dom.modeTabs, dom.modeTabsPrev, dom.modeTabsNext, setMode);
  bindFilterScroller(dom.secondaryTabs, dom.secondaryTabsPrev, dom.secondaryTabsNext, setSecondaryMode);
  window.addEventListener("resize", updateTabScrollAffordance, { passive: true });

  dom.searchInput.addEventListener("input", () => {
    setSearchExpanded(true);
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      state.visibleCount = pageSizeForView();
      renderCards();
    }, 90);
  });

  dom.searchToggle.addEventListener("click", () => {
    const expanded = !dom.headerSearch.classList.contains("is-open");
    setSearchExpanded(expanded, { focus: expanded });
  });

  dom.headerSearch.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") setSearchExpanded(true);
  });

  dom.headerSearch.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse" || dom.searchInput.value || dom.headerSearch.contains(document.activeElement)) return;
    setSearchExpanded(false);
  });

  dom.headerSearch.addEventListener("focusin", () => setSearchExpanded(true));
  dom.headerSearch.addEventListener("focusout", () => {
    window.requestAnimationFrame(() => {
      if (!dom.searchInput.value && !dom.headerSearch.contains(document.activeElement)) setSearchExpanded(false);
    });
  });

  dom.langToggle.addEventListener("click", () => {
    state.currentLang = state.currentLang === "zh" ? "en" : "zh";
    writeStorage(STORAGE_KEYS.language, state.currentLang);
    renderAll();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dom.detailPanel.classList.contains("open")) {
      event.preventDefault();
      closePanel();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setSearchExpanded(true, { focus: true });
    }
    if (event.key === "Escape" && dom.headerSearch.classList.contains("is-open")) {
      if (document.activeElement === dom.searchInput) dom.searchToggle.focus({ preventScroll: true });
      if (!dom.searchInput.value) setSearchExpanded(false);
    }
    if (event.key === "Tab" && dom.detailPanel.classList.contains("open")) {
      const focusable = [...dom.detailPanel.querySelectorAll("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")]
        .filter((element) => !element.hasAttribute("disabled") && element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener("hashchange", () => {
    const { view, taskId, channelId } = parseRouteHash();
    if (VIEWS[view]) switchView(view, { push: false, focus: true, force: view !== state.currentView || taskId !== state.activeTaskId || channelId !== state.activeTaskChannel, taskId, taskChannel: channelId });
  });
}

function init() {
  cacheDom();
  loadPreferences();
  const { view: hashView, taskId, channelId } = parseRouteHash();
  if (VIEWS[hashView]) {
    state.currentView = hashView;
    state.activeTaskId = taskEntryForId(taskId)?.id || null;
    state.activeTaskChannel = taskChannelForId(state.activeTaskId, channelId)?.id || null;
    state.workflowExpanded = taskChannelForId(state.activeTaskId, state.activeTaskChannel)?.kind === "workflows";
    state.workflowTaskFilter = state.workflowExpanded ? state.activeTaskId : null;
    applyTaskFilters(state.activeTaskId);
  }
  else updateHash("home", true);
  state.visibleCount = pageSizeForView(state.currentView);
  bindEvents();
  applyTranslations();
  renderAll();
  loadData();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();


/* polish: view swap animation + scroll reveal for big sections */
function playViewSwap() {
  const main = dom.mainContent;
  if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  main.classList.remove("is-view-swapping");
  void main.offsetWidth;
  main.classList.add("is-view-swapping");
  window.clearTimeout(playViewSwap.timer);
  playViewSwap.timer = window.setTimeout(() => main.classList.remove("is-view-swapping"), 800);
}

(function setupSectionReveal() {
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
  const arm = () => {
    for (const el of document.querySelectorAll("#homeLeaderboard, #skillLeaderboard, #surfaceOverview, .brief-picks, .brief-cta")) {
      if (el.dataset.revealArmed) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) continue;
      el.dataset.revealArmed = "1";
      el.classList.add("reveal-ready");
      observer.observe(el);
    }
  };
  window.addEventListener("load", () => window.setTimeout(arm, 400));
  document.addEventListener("click", () => window.setTimeout(arm, 300));
})();
