const Request = require("request-promise-native");
const Env = require("../env");
const Logger = require("../logger");
const QueryString = require("querystring");
const LinkHeaderParse = require("parse-link-header");

const options = {
  headers: {
    "Private-Token": Env.GITLAB_PERSONAL_TOKEN,
  },
  json: true,
};

exports._decorateLinks = (link, templateFunction, templateArgs, query) => {
  const linkObj = {};
  if (link) {
    link = LinkHeaderParse(link);
    for (const key of Object.keys(link)) {
      linkObj[key] = () =>
        templateFunction.apply(null, [
          ...templateArgs,
          { ...query, page: link[key].page, per_page: link[key].per_page },
        ]);
    }
  }
  return linkObj;
};

exports.getRepoByProjectId = async (projectId) => {
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}`,
    ...options,
  });
};

exports.searchMergeRequestsByProjectId = async (projectId, query) => {
  const queryString = query ? QueryString.stringify(query) : null;
  const res = await Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/merge_requests${
      queryString ? `?${queryString}` : ""
    }`,
    ...options,
    resolveWithFullResponse: true,
  });
  return {
    mergeRequests: res.body,
    _link: {
      ...exports._decorateLinks(
        res.headers.link,
        exports.searchMergeRequestsByProjectId,
        [projectId],
        query
      ),
    },
  };
};

exports.searchIssuesByProjectId = async (projectId, query) => {
  const queryString = query ? QueryString.stringify(query) : null;
  const res = await Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/issues${
      queryString ? `?${queryString}` : ""
    }`,
    ...options,
    resolveWithFullResponse: true,
  });
  return {
    issues: res.body,
    _link: {
      ...exports._decorateLinks(
        res.headers.link,
        exports.searchIssuesByProjectId,
        [projectId],
        query
      ),
    },
  };
};

exports.searchTagsByProjectId = async (projectId, query) => {
  const queryString = query ? QueryString.stringify(query) : null;
  const res = await Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/tags${
      queryString ? `?${queryString}` : ""
    }`,
    ...options,
    resolveWithFullResponse: true,
  });
  return {
    tags: res.body,
    _link: {
      ...exports._decorateLinks(
        res.headers.link,
        exports.searchTagsByProjectId,
        [projectId],
        query
      ),
    },
  };
};

exports.getMergeRequestByProjectIdAndMergeRequestId = async (
  projectId,
  mergeRequestId
) => {
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/merge_requests/${mergeRequestId}`,
    ...options,
  });
};

exports.getIssueByProjectIdAndIssueId = async (projectId, issueId) => {
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/issues/${issueId}`,
    ...options,
  });
};

exports.getTagByProjectIdAndTagId = async (projectId, tagName) => {
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/tags/${tagName}`,
    ...options,
  });
};

exports.getCommitByProjectIdAndSha = async (projectId, sha) => {
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/commits/${sha}`,
    ...options,
  });
};

exports.findCommitRefsByProjectIdAndSha = async (projectId, sha, query) => {
  const queryString = query ? QueryString.stringify(query) : null;
  return Request({
    uri: `${
      Env.GITLAB_API_ENDPOINT
    }/projects/${projectId}/repository/commits/${sha}/refs${
      queryString ? `?${queryString}` : ""
    }`,
    ...options,
  });
};

exports.createTagReleaseByProjectIdTagNameAndTagId = async (
  projectId,
  tagName,
  body
) => {
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/tags/${tagName}/release`,
    method: "POST",
    body,
    ...options,
  });
};

exports.updateTagReleaseByProjectIdTagNameAndTagId = async (
  projectId,
  tagName,
  body
) => {
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/tags/${tagName}/release`,
    method: "PUT",
    body,
    ...options,
  });
};
/* EC */
exports.getReadmeByProjectId = async (projectId, _branch) => {
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/files/README%2Emd/raw?ref=${_branch}`,
    ...options,
  });
};
/* EC */
exports.createReadmeByProjectId = async (projectId, _content, _branch) => {
  const body = {
    content: _content,
    commit_message: "autogenerado por release note generator",
    branch: _branch,
  };
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/files/README%2Emd`,
    method: "POST",
    body,
    ...options,
  });
};

/* EC */
exports.updateReadmeByProjectId = async (projectId, _content, _branch) => {
  const body = {
    content: _content,
    commit_message: "autogenerado por release note generator",
    branch: _branch,
  };
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/files/README%2Emd`,
    method: "PUT",
    body,
    ...options,
  });
};

/* EC */
exports.upsertReadmeContentByProjectId = async (projectId, branch, content) => {
  const req = await exports.getReadmeByProjectId(projectId, branch);
  /*if (readmeContent) {
    Logger.debug(`Creating a new readme`);
    return await exports.createReadmeByProjectId(projectId, content, branch);
  } else {
    
  }*/
  content = content + "\n" + req;
  return await exports.updateReadmeByProjectId(projectId, content, branch);
};
