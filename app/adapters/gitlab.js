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
exports.findCommitsByProjectId = async (projectId, startDate, endDate) => {
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/commits`,
    ...options,
  });
};
/* EC */
exports.getFileByProjectId = async (projectId, fileName, branch) => {
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/files/${fileName}/raw?ref=${branch}`,
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
  const req = await exports.getFileByProjectId(projectId, "README%2Emd", branch);
  /*if (readmeContent) {
    Logger.debug(`Creating a new readme`);
    return await exports.createReadmeByProjectId(projectId, content, branch);
  } else {
    
  }*/
  content = content + "\n" + req;
  return await exports.updateReadmeByProjectId(projectId, content, branch);
};

/* EC */
exports.getCommitByMergeRequest = async (projectId, mergeRequest) => {
  Logger.debug(`${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/merge_requests/${mergeRequest}/commits`)
  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/merge_requests/${mergeRequest}/commits`,
    ...options,
  });
};

/* EC */
exports.upgradePackageVersion = async (projectId, sourceBranch, targetBranch) => {
  const file = await exports.getFileByProjectId(projectId, "package%2Ejson", targetBranch);
  Logger.debug("read package.json file...");
  let jsonText = JSON.parse(JSON.stringify(file));
  let v = jsonText.version;
  Logger.debug(`current version is: ${v}`)
  let sv = v.split(".");
  sv[sv.length-1] = (Number(sv[sv.length-1])+1).toString();
  v = sv.join(".");
  jsonText.version = v;

  if(sourceBranch == "develop") {
    Logger.debug(`upgrading version to: ${jsonText.version} in ${sourceBranch}`)
    let body = {
      content: JSON.stringify(jsonText, null, '\t'),
      commit_message: "autogenerado por release note generator",
      branch: sourceBranch,
    };
  
    const req1 = await Request({
      uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/files/package%2Ejson`,
      method: "PUT",
      body,
      ...options,
    });
  }

  Logger.debug(`upgrading version to: ${jsonText.version} in ${targetBranch}`)
  let body = {
    content: JSON.stringify(jsonText, null, '\t'),
    commit_message: "autogenerado por release note generator",
    branch: targetBranch,
  };

  return Request({
    uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/files/package%2Ejson`,
    method: "PUT",
    body,
    ...options,
  });
};