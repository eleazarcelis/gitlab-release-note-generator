const _ = require("lodash");
const IssueLib = require("./issue");
const MergeRequestLib = require("./mergeRequest");
const TagLib = require("./tag");
const GitlabLib = require("../adapters/gitlab");  /* EC */
const ChangelogLib = require("./changelog");
const Logger = require("../logger");
const Moment = require("moment-timezone");
const Env = require("../env");

exports.generate = async () => {
  const tags = await TagLib.getLatestAndSecondLatestTagByProjectId(Env.GITLAB_PROJECT_ID);
  Logger.debug(`Tags found: ${tags.length}`);
  if (tags.length !== 2) throw new Error("Cannot find latest and second latest tag. Tag Result: " + JSON.stringify(tags));
  const [latestTag, secondLatestTag] = tags;

  if (!_.get(latestTag, "commit.committed_date") || !_.get(secondLatestTag, "commit.committed_date")) throw new Error(`Cannot find latest and second latest tag. Abort the program!`);
  const startDate = _.get(secondLatestTag, "commit.committed_date");
  let endDate = _.get(latestTag, "commit.committed_date");

  Logger.debug(`startDate: ${startDate}`);
  Logger.debug(`endDate: ${endDate}`);

  // allow the end date to be adjusted by a few seconds to catch issues that are automatially closed by
  // a MR and are time stamped a few seconds later.
  if (Env.ISSUE_CLOSED_SECONDS > 0) {
    Logger.debug(`EndDate:        ${endDate}`);
    Logger.debug(`Adding Seconds: ${Env.ISSUE_CLOSED_SECONDS}`);
    endDate = Moment.tz(endDate, Env.TZ).add(Env.ISSUE_CLOSED_SECONDS, "seconds").utc().format();
    Logger.debug(`New End Date:   ${endDate}`);
  }

  const changeLog = await ChangelogLib.getChangelogByStartAndEndDate(startDate, endDate);
  const changeLogContent = await ChangelogLib.generateChangeLogContent(changeLog, latestTag, {useSlack: false});

  /* EC */
  Logger.debug(`Writing README in ${Env.TARGET_BRANCH}...`);
  await GitlabLib.upsertReadmeContentByProjectId(Env.GITLAB_PROJECT_ID, Env.TARGET_BRANCH, changeLogContent);

  Logger.debug(`Changelog: ${changeLogContent}`);
  await TagLib.upsertTagDescriptionByProjectIdAndTag(Env.GITLAB_PROJECT_ID, latestTag, changeLogContent);

  /* EC */
  Logger.debug(`Upgrading package version`);
  return await GitlabLib.upgradePackageVersion(Env.GITLAB_PROJECT_ID, Env.SOURCE_BRANCH, Env.TARGET_BRANCH);
};
