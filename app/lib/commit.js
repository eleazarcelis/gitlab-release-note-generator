const Gitlab = require("../adapters/gitlab");

exports.findBranchRefsByProjectIdAndSha = async (projectId, sha) => {
  return Gitlab.findCommitRefsByProjectIdAndSha(projectId, sha, {
    type: "branch",
  });
};
exports.findCommitsByProjectId = async (projectId, startDate, endDate) => {
    return Gitlab.findCommitsByProjectId(projectId, startDate, endDate);
};
/* EC */
exports.decorateCommit = (commit, options = {}) => {
  return exports.gitLabDecorator(commit);
};
/* EC */
exports.gitLabDecorator = (commit) => {
  return `- ${commit.title} [#${commit.short_id}](${commit.web_url})`;
};
