# OrchesTree
OrchesTree Cloud is an open-source React web application that interprets plain-language infrastructure descriptions, passes them through a two-stage LLM prompt chain, and outputs a fully in-lined SVG architecture diagram rendered by the Python Diagrams library and Graphviz — all served from Azure App Service with serverless workers for scale. The built-in icon library covers the seven largest public-cloud vendors (AWS, Azure, Google Cloud, Alibaba Cloud, Oracle Cloud Infrastructure, IBM Cloud, and Tencent Cloud), allowing architects to depict heterogeneous environments in a single, portable graphic.

---

## Core Workflow

1. **Input** – User submits free-form text via the React interface.
2. **LLM Pass 1** – Natural language is converted to a YAML skeleton of resources and relationships.
3. **LLM Pass 2** – Each resource is tagged with a provider-specific icon identifier.
4. **Icon Resolution** – Regex maps identifiers to local SVG icons for all seven providers.
5. **Rendering** – The Diagrams library generates a Graphviz DOT graph and emits an SVG with every icon in-lined.
6. **Delivery** – The SVG is streamed back to the React UI for preview, minor edits, and download.

---

## Technology Stack

| Layer          | Technology                                                   | Purpose                                                         |
| -------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| Front-end      | React.js                                                     | Prompt input, live preview, export                              |
| AI Processing  | Two-stage LLM prompts                                        | Structure & annotate diagram                                    |
| Diagram Engine | Python Diagrams + Graphviz                                   | Code-based layout & SVG build                                   |
| Icon Library   | Local SVG sets (AWS, Azure, GCP, Alibaba, OCI, IBM, Tencent) | Provider-specific visuals                                       |
| Hosting        | Azure App Service + Functions                                | Managed, automatically scalable runtime                         |
| Output         | Self-contained SVG                                           | Portable, version-control friendly                              |

---

## Distinguishing Strengths

* **Multi-cloud parity** – Out-of-the-box icon coverage for the industry’s top seven providers ensures diagrams accurately reflect hybrid architectures.
* **Diagram-as-Code reliability** – Graph generation is deterministic and repeatable, easing CI/CD documentation workflows.
* **Serverless scalability** – Rendering tasks can spike without manual capacity planning thanks to Azure Functions behind the App Service front end. ([Microsoft Azure][8])

---

### At a Glance

* **Input**: English text
* **Output**: Single SVG file
* **Cloud Coverage**: AWS, Azure, GCP, Alibaba, OCI, IBM, Tencent
* **Primary Tech**: React · Python Diagrams · Graphviz · Azure App Service

OrchesTree Cloud delivers design-grade architecture visuals in seconds, streamlining the leap from concept to shareable cloud diagram.

[8]: https://azure.microsoft.com/en-us/products/app-service?utm_source=chatgpt.com "Azure App Service"
