ECHO OFF
ECHO "Bumping version to:"
npm version --commit-hooks=false patch
exit 0
