#!/usr/bin/env bash
# Setup GitHub Project (Projects v2) for MyClup
# Usage: ./scripts/setup-github-project.sh
# Requires: gh auth login --scopes project

set -e
OWNER="${1:-@me}"
REPO="${2:-birkanalp/my-clup}"
cd "$(dirname "$0")/.."

echo "Creating project 'MyClup Development'..."
PROJECT_JSON=$(gh project create --owner "$OWNER" --title "MyClup Development" --format json 2>/dev/null || true)
if [[ -z "$PROJECT_JSON" ]]; then
  echo "Error: Could not create project. Run: gh auth refresh -s project"
  exit 1
fi

PROJECT_NUMBER=$(echo "$PROJECT_JSON" | jq -r '.number')
PROJECT_ID=$(echo "$PROJECT_JSON" | jq -r '.id')
echo "Created project #$PROJECT_NUMBER"

# Resolve owner for API (users vs orgs)
if [[ "$OWNER" == "@me" ]]; then
  OWNER=$(gh api user -q .login)
fi
API_OWNER="$OWNER"

# Determine API base (user vs org)
if gh api "orgs/$OWNER" --jq .login 2>/dev/null >/dev/null; then
  API_BASE="orgs/$OWNER/projectsV2/$PROJECT_NUMBER"
else
  API_BASE="users/$OWNER/projectsV2/$PROJECT_NUMBER"
fi

echo ""
echo "Adding custom fields..."

# Status (single select)
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" --name "Status" --data-type SINGLE_SELECT \
  --single-select-options "proposed,clarified,scoped,assigned,in-progress,implemented,tested,reviewed,approved,integrated,done,blocked" 2>/dev/null || echo "  Status: may already exist"

# Owner (text)
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" --name "Owner" --data-type TEXT 2>/dev/null || echo "  Owner: may already exist"

# Priority (single select)
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" --name "Priority" --data-type SINGLE_SELECT \
  --single-select-options "p0,p1,p2" 2>/dev/null || echo "  Priority: may already exist"

# Surface (single select)
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" --name "Surface" --data-type SINGLE_SELECT \
  --single-select-options "mobile-user,mobile-admin,web-gym-admin,web-platform-admin,web-site,shared" 2>/dev/null || echo "  Surface: may already exist"

# Type (single select)
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" --name "Type" --data-type SINGLE_SELECT \
  --single-select-options "feature,bug,tech-debt,docs,infra" 2>/dev/null || echo "  Type: may already exist"

# Risk Level (single select)
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" --name "Risk Level" --data-type SINGLE_SELECT \
  --single-select-options "low,medium,high" 2>/dev/null || echo "  Risk Level: may already exist"

echo ""
echo "Linking project to repository $REPO..."
gh project link "$PROJECT_NUMBER" --owner "$OWNER" --repo "$REPO" 2>/dev/null || echo "  Link may already exist"

echo ""
echo "Creating views..."

# Get field IDs for group_by (REST API returns integer IDs; name can be .name.raw or .name)
FIELDS_JSON=$(gh api "$API_BASE/fields" --jq '.' 2>/dev/null || echo "[]")
field_id() { echo "$FIELDS_JSON" | jq -r --arg n "$1" '.[] | select((.name.raw? // .name) == $n) | .id' 2>/dev/null | head -1; }
STATUS_FIELD_ID=$(field_id "Status")
OWNER_FIELD_ID=$(field_id "Owner")
SURFACE_FIELD_ID=$(field_id "Surface")
PRIORITY_FIELD_ID=$(field_id "Priority")

# Workflow Board - group by Status
if [[ -n "$STATUS_FIELD_ID" ]]; then
  gh api -X POST "$API_BASE/views" -f name="Workflow Board" -f layout=board -f group_by="[$STATUS_FIELD_ID]" 2>/dev/null || \
  gh api -X POST "$API_BASE/views" -f name="Workflow Board" -F layout=board 2>/dev/null || true
  echo "  Created: Workflow Board (Board, group by Status)"
fi

# Owner Board - group by Owner
if [[ -n "$OWNER_FIELD_ID" ]]; then
  gh api -X POST "$API_BASE/views" -f name="Owner Board" -f layout=board -f group_by="[$OWNER_FIELD_ID]" 2>/dev/null || \
  gh api -X POST "$API_BASE/views" -f name="Owner Board" -F layout=board 2>/dev/null || true
  echo "  Created: Owner Board (Board, group by Owner)"
fi

# Surface Board - group by Surface
if [[ -n "$SURFACE_FIELD_ID" ]]; then
  gh api -X POST "$API_BASE/views" -f name="Surface Board" -f layout=board -f group_by="[$SURFACE_FIELD_ID]" 2>/dev/null || \
  gh api -X POST "$API_BASE/views" -f name="Surface Board" -F layout=board 2>/dev/null || true
  echo "  Created: Surface Board (Board, group by Surface)"
fi

# Priority Table - sort by Priority
gh api -X POST "$API_BASE/views" -f name="Priority Table" -f layout=table 2>/dev/null || true
echo "  Created: Priority Table (Table, sort by Priority)"

echo ""
echo "Done."
echo ""
echo "Project URL: https://github.com/users/$OWNER/projects/$PROJECT_NUMBER"
if [[ "$OWNER" != "orgs"* ]]; then
  echo "Alternative: https://github.com/$OWNER?tab=projects"
fi
