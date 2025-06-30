ECHO OFF
ECHO "Adding changes to commit"
start /wait git add package.json
start /wait git add package-lock.json
ECHO "Committing new version"
start /wait git commit --no-verify -m "Version bump"
ECHO "Pushing new version"
start /wait git push
ECHO "New version successfully pushed to the branch"
exit 0
