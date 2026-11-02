---
title: 从 Hello World 理解 A2A：Agent 如何发现彼此并协作
description: 结合 Python Hello World 示例，理解 A2A 的 AgentCard、AgentSkill、Message、Task、Artifact，以及客户端到执行器的完整调用过程。
createTime: 2026/11/02 00:00:00
categories:
  - 项目
tags:
  - AI
  - A2A
  - Python
  - Agent
---

# 从 Hello World 理解 A2A：Agent 如何发现彼此并协作

当系统里只有一个 AI Agent 时，交互通常很直接：用户提出问题，Agent 调用模型或工具，然后返回答案。

当多个独立 Agent 需要协作时，我们就需要回答更多问题：如何知道另一个 Agent 能做什么？请求应该发到哪里？任务还在执行，还是已经完成？最终结果用什么格式返回？

A2A（Agent2Agent）为这些交互提供共同约定，让不同实现的 Agent 能够交换消息、跟踪任务并交付结果。

本文从官方 Python Hello World 示例出发，沿着一条消息的执行过程，理解 A2A 的核心概念和代码结构。

> 版本说明：本文代码以写作时核对的 Hello World 示例为准，其依赖声明为 `a2a-sdk==1.1.0`，接口声明的协议版本为 `1.0`。SDK 版本、协议版本和 Agent 应用版本是不同概念。文中的代码片段用于解释局部逻辑，完整运行请使用文末链接中的示例项目，并核对其依赖版本。

## 1. A2A 解决什么问题

假设我们开发了一个旅行助手。用户提出“安排一次去杭州的旅行”，旅行助手可以把酒店查询交给酒店 Agent，把交通查询交给交通 Agent，再整理各方结果。

这些 Agent 可能由不同团队开发，也可能使用不同框架。调用方需要了解对方的能力与通信方式，但不必了解它内部的提示词、模型调用链和数据库实现。

A2A 定义的就是这层对外协作约定，主要涉及能力描述、消息交换、任务状态和结果交付。协议的定位可参阅 [A2A 官方介绍](https://a2a-protocol.org/latest/)。

至于应该选择哪个 Agent、如何拆解需求、如何判断结果质量，仍然需要应用自身实现。接入协议并不会自动产生业务编排逻辑。

## 2. 先看 Hello World 的整体结构

官方 Python 教程先使用简单的问候服务演示协议，再引入更复杂的模型应用。Hello World 不需要模型 API Key，业务逻辑只是接收文本并返回问候。

一次交互可以分成两段：

```text
发现服务：
A2A Client → 获取 Agent Card → 了解能力和调用地址

发送消息：
A2A Client
    ↓ 发送协议请求
A2A Server / RequestHandler
    ↓ 调用执行入口
AgentExecutor
    ↓ 调用业务逻辑
HelloWorldAgent
    ↓ 返回业务结果
AgentExecutor 发布状态和结果事件
    ↓
A2A Client 接收响应
```

Client 和 Server 表示交互中的角色。一个 Agent 可以接收上游请求，同时作为 Client 调用其他 Agent。

如果额外使用网页界面，一种常见结构是“浏览器 → GUI 后端 → A2A Server”。此时，真正通过 A2A SDK 发起调用的是 GUI 后端。

## 3. AgentSkill：描述一项业务能力

Hello World 首先定义一项 `AgentSkill`：

```python
skill = AgentSkill(
    id="echo_bot",
    name="Echo Bot",
    description="接收消息并返回 Hello World",
    tags=["echo"],
    input_modes=["text/plain"],
    output_modes=["text/plain"],
)
```

它描述 Agent 的一项业务能力：

| 字段 | 含义 |
| --- | --- |
| `id` | 能力标识 |
| `name` | 能力名称 |
| `description` | 能力说明 |
| `tags` | 用于描述能力的标签 |
| `input_modes` | 支持的输入媒体类型 |
| `output_modes` | 支持的输出媒体类型 |

例如，旅行 Agent 可以同时声明查询航班、推荐酒店和规划行程三项 Skill。

**Skill 是描述信息，不会自动绑定 Python 函数。** 在列表里增加“查询天气”，不会让 Agent 自动具备天气查询能力；实际执行逻辑仍需开发者实现。

## 4. AgentCard：描述整个 Agent

`AgentCard` 将身份、能力和调用方式放在一起：

```python
public_agent_card = AgentCard(
    name="Hello World Agent",
    description="一个问候示例",
    version="0.0.1",
    default_input_modes=["text/plain"],
    default_output_modes=["text/plain"],
    capabilities=AgentCapabilities(streaming=True),
    supported_interfaces=[
        AgentInterface(
            protocol_binding="JSONRPC",
            url="http://127.0.0.1:9999",
            protocol_version="1.0",
        )
    ],
    skills=[skill],
)
```

三个容易混淆的概念可以这样区分：

| 概念 | 回答的问题 | 例子 |
| --- | --- | --- |
| `AgentCard` | 整个 Agent 是谁、怎么调用？ | 名称、接口地址、协议 |
| `AgentSkill` | 它有什么业务能力？ | 问候、查询航班 |
| `capabilities` | 它支持哪些协议交互能力？ | 流式响应 |

上面的 `version="0.0.1"` 是 Agent 应用版本；`protocol_version="1.0"` 是接口使用的协议版本；`a2a-sdk==1.1.0` 则是 Python 库版本。排查兼容性问题时，应分别核对。

卡片中的声明也不等于实现证明。是否真正支持某项能力，需要由服务端行为保证。

## 5. 将能力声明与执行逻辑连接起来

服务端通过 `DefaultRequestHandler` 连接执行器与任务存储：

```python
request_handler = DefaultRequestHandler(
    agent_executor=HelloWorldAgentExecutor(),
    task_store=InMemoryTaskStore(),
    agent_card=public_agent_card,
)
```

其中，`HelloWorldAgentExecutor` 是业务执行入口，`InMemoryTaskStore` 保存任务信息。后者使用内存存储，因此进程重启后任务数据会丢失。

接着创建路由并启动服务：

```python
routes = []
routes.extend(create_agent_card_routes(public_agent_card))
routes.extend(create_jsonrpc_routes(request_handler, "/"))

app = Starlette(routes=routes)
uvicorn.run(app, host="127.0.0.1", port=9999)
```

这个示例提供两个关键入口：

```text
GET  /.well-known/agent-card.json
     获取 Agent Card

POST /
     接收 JSON-RPC 协议请求
```

读取卡片只是在发现服务，不会进入问候逻辑。发送消息后，请求才会交给执行器处理。

## 6. Client 如何发现 Agent 并发送消息

客户端首先获取卡片：

```python
async with httpx.AsyncClient() as httpx_client:
    resolver = A2ACardResolver(
        httpx_client=httpx_client,
        base_url="http://127.0.0.1:9999",
    )
    card = await resolver.get_agent_card()
```

随后根据卡片创建客户端，构造用户消息并接收响应：

```python
client = await create_client(
    agent=card,
    client_config=ClientConfig(streaming=True),
)

message = new_text_message("你好", role=Role.ROLE_USER)
request = SendMessageRequest(message=message)

try:
    async for event in client.send_message(request):
        print(event)
finally:
    # 无论调用是否成功，都释放客户端持有的连接资源。
    await client.close()
```

SDK 帮助处理协议对象和通信细节。应用仍然负责消息内容、异常处理和资源生命周期。

## 7. Message、Task 和 Artifact 的区别

理解执行器之前，先区分几个数据对象：

| 对象 | 含义 | Hello World 中的例子 |
| --- | --- | --- |
| `Message` | 一次交流内容 | 用户发送“你好” |
| `Task` | 一项具有状态的工作 | 正在处理问候请求 |
| `Artifact` | 任务产生的交付结果 | 最终问候文本 |
| `Part` | Message 或 Artifact 的内容单元 | 一段文本 |

A2A 允许服务直接返回 Message，因此不是每次交流都必须创建 Task。本文的 Hello World 采用任务式处理，便于演示状态变化和结果交付。相关定义见 [官方核心概念](https://a2a-protocol.org/latest/topics/key-concepts/)。

还需要区分 `task_id` 与 `context_id`：前者标识具体任务，后者用于关联同一交互上下文。上下文标识有助于组织交互，但业务层仍需要决定如何保存和使用历史信息。

## 8. AgentExecutor 如何处理请求

示例的执行流程如下：

```text
获取或创建任务
    ↓
发布“处理中”状态
    ↓
提取用户文本并调用业务 Agent
    ↓
发布结果 Artifact
    ↓
发布“已完成”状态
```

### 8.1 获取或创建任务

```python
if context.current_task:
    task = context.current_task
else:
    task = new_task_from_user_message(context.message)
    await event_queue.enqueue_event(task)
```

`RequestContext` 提供本次请求的上下文。示例在已有任务时复用它，否则根据用户消息创建任务并发布事件。

### 8.2 更新任务状态

```python
task_updater = TaskUpdater(
    event_queue=event_queue,
    task_id=task.id,
    context_id=task.context_id,
)

await task_updater.update_status(
    state=TaskState.TASK_STATE_WORKING,
    message=new_text_message("Processing request..."),
)
```

`TaskUpdater` 帮助执行器发布状态与结果事件，让协议处理层能够向客户端传递任务进展。

### 8.3 调用业务 Agent

```python
query = get_message_text(context.message)

if query:
    result = await self.agent.invoke(user_request=query)
else:
    result = "No text input is provided!"
```

业务 Agent 的实现只是字符串拼接：

```python
class HelloWorldAgent:
    """提供问候业务，不调用大模型。"""

    async def invoke(self, user_request: str) -> str:
        """返回包含用户输入的问候文本。"""
        return (
            "Hello, World! "
            f"I have received your request ({user_request})"
        )
```

输入“你好”时，结果是：

```text
Hello, World! I have received your request (你好)
```

这说明 A2A 的通信过程可以独立于模型调用。接入真实业务时，可以将这里替换为检索、工具调用或模型推理。

### 8.4 发布结果并完成任务

```python
await task_updater.add_artifact(
    parts=[
        new_text_part(
            text=result,
            media_type="text/plain",
        )
    ]
)

await task_updater.update_status(
    state=TaskState.TASK_STATE_COMPLETED,
    message=new_text_message("Request is completed!"),
)
```

业务 Agent 负责计算结果，Executor 负责把执行过程转换成协议层的任务、状态和结果事件。这种分工便于在保留通信结构的同时扩展业务能力。

## 9. 流式响应不一定是逐字输出

聊天产品常把“流式”表现为文字逐字出现。但 A2A 的流式交互还可以传递任务信息、状态更新和结果更新。

Hello World 一次性生成问候文本，再发布完整 Artifact。因此，即使客户端启用 `streaming=True`，也不会自动让业务逻辑逐个 token 输出。

如果希望逐步展示模型生成的文字，需要业务层取得模型的增量输出，再通过适当的协议事件传递给客户端。

## 10. 运行并观察官方示例

以下命令适用于 Linux 或 macOS，并假设已经安装 Git 和 uv。Windows 下需要将 Python 可执行文件路径调整为 `.venv\Scripts\python.exe`。

先获取官方仓库：

```bash
git clone https://github.com/a2aproject/a2a-samples.git
cd a2a-samples
```

检查 `samples/python/agents/helloworld/requirements.txt`。本文核对的版本声明为 `a2a-sdk==1.1.0`；如果上游已更新，应结合对应版本的 README 和代码使用，避免混用不同版本的 API。

创建环境并安装示例依赖：

```bash
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python \
  -r samples/python/agents/helloworld/requirements.txt \
  -r samples/python/requirements.txt
```

启动服务端：

```bash
.venv/bin/python samples/python/agents/helloworld/__main__.py
```

保持这个终端运行，在另一个终端进入同一仓库，读取 Agent Card：

```bash
curl -s http://127.0.0.1:9999/.well-known/agent-card.json \
  | .venv/bin/python -m json.tool
```

重点观察 `skills`、`capabilities` 和 `supportedInterfaces`。Python 中的 `supported_interfaces` 在 JSON 中表现为 `supportedInterfaces`。

随后运行交互客户端：

```bash
.venv/bin/python samples/python/agents/helloworld/test_client.py
```

输入“你好”，观察返回的任务与结果；输入 `exit` 退出客户端。

也可以使用 pytest 执行示例测试：

```bash
.venv/bin/python -m pytest \
  samples/python/agents/helloworld/test_client.py -q
```

执行测试前先停止手动启动的服务。该测试文件的 fixture 会自行启动服务端，已有进程占用 `9999` 端口会干扰测试。

如果使用 PyCharm，可将解释器设置为项目的 `.venv/bin/python`，分别为服务端的 `__main__.py` 和客户端的 `test_client.py` 创建运行配置。运行客户端前，先启动服务端。

## 11. 下一步：接入真正的业务能力

读懂 Hello World 后，可以先把 `invoke()` 改为返回当前时间，再逐步接入文档检索或模型调用。每次扩展都应同时考虑三个问题：

1. Agent Card 的能力说明是否与实际实现一致？
2. 任务状态是否准确反映执行进展和失败情况？
3. 最终结果是否以客户端能够理解的形式交付？

如果业务需要跨重启保留任务，还要替换或扩展内存任务存储。示例的取消方法未实现，不能因为存在取消接口就认为任务已经支持取消。

从问候服务扩展到文档问答时，核心业务可以变成“检索证据 → 生成答案 → 返回引用”。A2A 则继续承担对外的能力描述、消息交换、状态传递和结果交付，让其他 Agent 能以统一方式使用这项能力。

## 参考资料

- [A2A 官方网站](https://a2a-protocol.org/latest/)
- [Python 入门教程](https://a2a-protocol.org/latest/tutorials/python/1-introduction/)
- [A2A 核心概念](https://a2a-protocol.org/latest/topics/key-concepts/)
- [官方示例仓库](https://github.com/a2aproject/a2a-samples)
- [Hello World 示例源码](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/agents/helloworld)
