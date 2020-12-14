const Gitlab = require("../adapters/gitlab");

exports.findBranchRefsByProjectIdAndSha = async (projectId, sha) => {
  return Gitlab.findCommitRefsByProjectIdAndSha(projectId, sha, { type: "branch" });
};
/* EC */
exports.findCommitMessageByProjectIdAndSha = async (projectId, sha) => {
    return Gitlab.findCommitMessageByProjectIdAndSha(projectId, sha);
};
/* EC */
exports.findCommitsByProjectId = async (projectId, branch, startDate, endDate) => {
    return Gitlab.findCommitsByProjectId(projectId, branch, {
        updated_before: endDate,
        updated_after: startDate
    });
};
/* EC */
exports.decorateCommit = (commit, options = {}) => {
    return exports.gitLabDecorator(commit)
};
/* EC */
exports.gitLabDecorator = (commit) => {
    return `- ${commit.title} [#${commit.short_id}](${commit.web_url})`;
};