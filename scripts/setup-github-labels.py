#!/usr/bin/env python3
"""
Setup GitHub labels for MyClup agent-driven workflow.
Usage: GITHUB_TOKEN=<token> python scripts/setup-github-labels.py [owner/repo]
Default repo: birkanalp/my-clup

Alternative (no Python SSL issues): ./scripts/setup-github-labels-gh.sh [owner/repo]
"""
import json
import os
import ssl
import sys
import urllib.parse
import urllib.request

REPO = sys.argv[1] if len(sys.argv) > 1 else "birkanalp/my-clup"
TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
API_BASE = f"https://api.github.com/repos/{REPO}"


def req(method, url, data=None):
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    body = json.dumps(data).encode() if data else None
    req_obj = urllib.request.Request(url, data=body, headers=headers, method=method)
    req_obj.add_header("Content-Type", "application/json")
    ctx = ssl.create_default_context()
    try:
        import certifi
        ctx.load_verify_locations(certifi.where())
    except ImportError:
        pass
    try:
        with urllib.request.urlopen(req_obj, context=ctx) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode() if e.fp else ""


def create_or_update_label(name, color, description):
    create_body = {"name": name, "color": color, "description": description}
    update_body = {"color": color, "description": description}
    status, _ = req("POST", f"{API_BASE}/labels", create_body)
    if status == 201:
        return "created", name
    if status == 422:  # Label exists
        encoded = urllib.parse.quote(name, safe="")
        status, _ = req("PATCH", f"{API_BASE}/labels/{encoded}", update_body)
        return ("updated" if status == 200 else "failed", name)
    return "failed", name


def main():
    if not TOKEN:
        print("Error: GITHUB_TOKEN or GH_TOKEN required")
        sys.exit(1)

    labels = [
        # OWNER (blue palette)
        ("owner:orchestrator", "8B5CF6", "Agent owning orchestration, sequencing, assignment. Only one owner label active at a time."),
        ("owner:pm", "6366F1", "Agent owning product management and scope. Only one owner label active at a time."),
        ("owner:architect", "3B82F6", "Agent owning architecture, contracts, design. Only one owner label active at a time."),
        ("owner:backend", "0EA5E9", "Agent owning backend, API, DB implementation. Only one owner label active at a time."),
        ("owner:web", "06B6D4", "Agent owning web apps implementation. Only one owner label active at a time."),
        ("owner:mobile", "14B8A6", "Agent owning mobile apps implementation. Only one owner label active at a time."),
        ("owner:ai", "10B981", "Agent owning AI features. Only one owner label active at a time."),
        ("owner:qa", "22C55E", "Agent owning testing and validation. Only one owner label active at a time."),
        ("owner:review", "84CC16", "Agent owning code review. Only one owner label active at a time."),
        ("owner:release", "EAB308", "Agent owning release and deploy. Only one owner label active at a time."),
        # STATE (purple palette)
        ("state:proposed", "94A3B8", "Lifecycle: work proposed but not yet clarified."),
        ("state:clarified", "94A3B8", "Lifecycle: requirements clarified."),
        ("state:scoped", "94A3B8", "Lifecycle: scope defined and bounded."),
        ("state:assigned", "60A5FA", "Lifecycle: assigned to an agent."),
        ("state:in-progress", "60A5FA", "Lifecycle: implementation in progress."),
        ("state:implemented", "60A5FA", "Lifecycle: implementation complete."),
        ("state:tested", "34D399", "Lifecycle: tests written and passing."),
        ("state:reviewed", "34D399", "Lifecycle: review passed."),
        ("state:approved", "34D399", "Lifecycle: approved for release."),
        ("state:integrated", "34D399", "Lifecycle: integrated."),
        ("state:done", "22C55E", "Lifecycle: complete and released."),
        ("state:blocked", "EF4444", "Lifecycle: blocked; cannot proceed."),
        # TYPE (green palette)
        ("type:feature", "22C55E", "Task type: new feature."),
        ("type:bug", "F43F5E", "Task type: bug fix."),
        ("type:tech-debt", "F97316", "Task type: technical debt."),
        ("type:docs", "64748B", "Task type: documentation."),
        ("type:infra", "64748B", "Task type: infrastructure."),
        # PRIORITY (red/orange palette)
        ("priority:p0", "EF4444", "Priority: critical."),
        ("priority:p1", "F97316", "Priority: high."),
        ("priority:p2", "EAB308", "Priority: medium."),
        # SURFACE (gray palette)
        ("surface:mobile-user", "94A3B8", "Surface: member-facing Expo app."),
        ("surface:mobile-admin", "94A3B8", "Surface: gym/instructor Expo app."),
        ("surface:web-gym-admin", "94A3B8", "Surface: gym admin panel."),
        ("surface:web-platform-admin", "94A3B8", "Surface: platform admin panel."),
        ("surface:web-site", "94A3B8", "Surface: public marketing website."),
        ("surface:shared", "64748B", "Surface: shared packages or cross-surface."),
    ]

    created, updated, failed = [], [], []
    print(f"Setting up labels for {REPO}...\n")

    for name, color, desc in labels:
        action, _ = create_or_update_label(name, color, desc)
        if action == "created":
            created.append(name)
            print(f"  Created: {name}")
        elif action == "updated":
            updated.append(name)
            print(f"  Updated: {name}")
        else:
            failed.append(name)
            print(f"  Failed:  {name}")

    print("\nDone.")
    print(f"Created: {len(created)}, Updated: {len(updated)}, Failed: {len(failed)}")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
