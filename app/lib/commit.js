const Gitlab = require("../adapters/gitlab");

exports.findBranchRefsByProjectIdAndSha = async (projectId, sha) => {
  return Gitlab.findCommitRefsByProjectIdAndSha(projectId, sha, {
    type: "branch",
  });
};
/* EC */
exports.findCommitsByProjectId = async (projectId, startDate, endDate) => {
  const req = Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/commits${
      queryString ? `?${queryString}` : ""
    }`,
    ...options,
  });
  if (req && req.length > 0) {
    return req.filter((item) => {
      return (
        item.committed_date.getTime() >= startDate.getTime() &&
        item.committed_date.getTime() <= endDate.getTime()
      );
    });
  } else {
    return [];
  }
};
/* EC */
exports.decorateCommit = (commit, options = {}) => {
  return exports.gitLabDecorator(commit);
};
/* EC */
exports.gitLabDecorator = (commit) => {
  return `- ${commit.title} [#${commit.short_id}](${commit.web_url})`;
};
