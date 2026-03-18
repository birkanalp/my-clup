#!/usr/bin/env bash
# Setup GitHub labels using gh CLI (avoids Python SSL issues)
# Usage: ./scripts/setup-github-labels-gh.sh
# Requires: gh auth login

set -e
REPO="${1:-birkanalp/my-clup}"
cd "$(dirname "$0")/.."

create_or_update() {
  local name="$1"
  local color="$2"
  local desc="$3"
  if gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null; then
    echo "  Created: $name"
  elif gh label edit "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null; then
    echo "  Updated: $name"
  else
    echo "  Failed:  $name"
  fi
}

echo "Setting up labels for $REPO..."
echo ""

echo "OWNER LABELS..."
create_or_update "owner:orchestrator" "8B5CF6" "Agent owning orchestration, sequencing, assignment. Only one owner label active at a time."
create_or_update "owner:pm" "6366F1" "Agent owning product management and scope. Only one owner label active at a time."
create_or_update "owner:architect" "3B82F6" "Agent owning architecture, contracts, design. Only one owner label active at a time."
create_or_update "owner:backend" "0EA5E9" "Agent owning backend, API, DB implementation. Only one owner label active at a time."
create_or_update "owner:web" "06B6D4" "Agent owning web apps implementation. Only one owner label active at a time."
create_or_update "owner:mobile" "14B8A6" "Agent owning mobile apps implementation. Only one owner label active at a time."
create_or_update "owner:ai" "10B981" "Agent owning AI features. Only one owner label active at a time."
create_or_update "owner:qa" "22C55E" "Agent owning testing and validation. Only one owner label active at a time."
create_or_update "owner:review" "84CC16" "Agent owning code review. Only one owner label active at a time."
create_or_update "owner:release" "EAB308" "Agent owning release and deploy. Only one owner label active at a time."
echo ""

echo "STATE LABELS..."
create_or_update "state:proposed" "94A3B8" "Lifecycle: work proposed but not yet clarified."
create_or_update "state:clarified" "94A3B8" "Lifecycle: requirements clarified."
create_or_update "state:scoped" "94A3B8" "Lifecycle: scope defined and bounded."
create_or_update "state:assigned" "60A5FA" "Lifecycle: assigned to an agent."
create_or_update "state:in-progress" "60A5FA" "Lifecycle: implementation in progress."
create_or_update "state:implemented" "60A5FA" "Lifecycle: implementation complete."
create_or_update "state:tested" "34D399" "Lifecycle: tests written and passing."
create_or_update "state:reviewed" "34D399" "Lifecycle: review passed."
create_or_update "state:approved" "34D399" "Lifecycle: approved for release."
create_or_update "state:integrated" "34D399" "Lifecycle: integrated."
create_or_update "state:done" "22C55E" "Lifecycle: complete and released."
create_or_update "state:blocked" "EF4444" "Lifecycle: blocked; cannot proceed."
echo ""

echo "TYPE LABELS..."
create_or_update "type:feature" "22C55E" "Task type: new feature."
create_or_update "type:bug" "F43F5E" "Task type: bug fix."
create_or_update "type:tech-debt" "F97316" "Task type: technical debt."
create_or_update "type:docs" "64748B" "Task type: documentation."
create_or_update "type:infra" "64748B" "Task type: infrastructure."
echo ""

echo "PRIORITY LABELS..."
create_or_update "priority:p0" "EF4444" "Priority: critical."
create_or_update "priority:p1" "F97316" "Priority: high."
create_or_update "priority:p2" "EAB308" "Priority: medium."
echo ""

echo "SURFACE LABELS..."
create_or_update "surface:mobile-user" "94A3B8" "Surface: member-facing Expo app."
create_or_update "surface:mobile-admin" "94A3B8" "Surface: gym/instructor Expo app."
create_or_update "surface:web-gym-admin" "94A3B8" "Surface: gym admin panel."
create_or_update "surface:web-platform-admin" "94A3B8" "Surface: platform admin panel."
create_or_update "surface:web-site" "94A3B8" "Surface: public marketing website."
create_or_update "surface:shared" "64748B" "Surface: shared packages or cross-surface."
echo ""

echo "Done."
