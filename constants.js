export const STATUS_BUSY = 'http://redpencil.data.gift/id/concept/JobStatus/busy';
export const STATUS_SCHEDULED = 'http://redpencil.data.gift/id/concept/JobStatus/scheduled';
export const STATUS_SUCCESS = 'http://redpencil.data.gift/id/concept/JobStatus/success';
export const STATUS_FAILED = 'http://redpencil.data.gift/id/concept/JobStatus/failed';

export const JOB_GRAPH = 'http://mu.semte.ch/graphs/harvesting';
export const EMAIL_GRAPH = 'http://mu.semte.ch/graphs/system/email'

export const JOB_TYPE = 'http://vocab.deri.ie/cogs#Job';
export const TASK_TYPE = 'http://redpencil.data.gift/vocabularies/tasks/Task';
export const ERROR_TYPE= 'http://open-services.net/ns/core#Error';

export const JOB_URI_PREFIX = 'http://redpencil.data.gift/id/job/';
export const TASK_URI_PREFIX = 'http://redpencil.data.gift/id/task/';
export const ERROR_URI_PREFIX = 'http://redpencil.data.gift/id/jobs/error/';
export const EMAIL_URI_PREFIX = 'http://data.lblod.info/id/emails/';
export const CONTAINER_URI_PREFIX = 'http://redpencil.data.gift/id/dataContainers/'

export const SERVICE_NAME = 'http://lblod.data.gift/services/download-url-warning-service';
export const JOB_OPERATION = 'http://lblod.data.gift/id/jobs/concept/JobOperation/downloadUrlWarning';
export const CHECK_FAILED_URL_DOWNLOADS_OPERATION = 'http://lblod.data.gift/id/jobs/concept/JobOperation/checkFailedUrlDownloads';

export const PREFIXES = `
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX task: <http://redpencil.data.gift/vocabularies/tasks/>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX oslc: <http://open-services.net/ns/core#>
  PREFIX cogs: <http://vocab.deri.ie/cogs#>
  PREFIX adms: <http://www.w3.org/ns/adms#>
  PREFIX nmo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#>
  PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
  PREFIX schema: <http://schema.org/>
`;

export const OUTBOX = 'http://data.lblod.info/id/mail-folders/2';

export const WARNING_EMAIL_SUBJECT = 'Failed downloads in Toezicht';

export const WARNING_EMAIL_TEXT = function(failedDownloads) {
  let urlInfo = '';
  failedDownloads.forEach(download => {
    urlInfo = `${urlInfo}
- Url: ${download?.url?.value} | RemoteUrl : ${download?.remoteUrl?.value} | ${download?.errorCode?.value}: "${download?.errorLabel?.value}"`;
  });

  return `
Hello,

An error occured while downloading some URLs submitted in Toezicht forms:
${urlInfo}

Have a nice day,
Redpencil.io
`;
}

export const WARNING_EMAIL_HTML = function(failedDownloads) {
  let urlInfo = '<ul>';
  failedDownloads.forEach(download => {
    urlInfo = `${urlInfo}
<li>Url: ${download?.url?.value} | RemoteUrl : ${download?.remoteUrl?.value} | ${download?.errorCode?.value}: "${download?.errorLabel?.value}"</li>`;
  });
  urlInfo = `${urlInfo}</ul>`;

  return `
<p>Hello,</p>
<p>An error occured while downloading some URLs submitted in Toezicht forms: ${urlInfo}</p>
<p>Have a nice day,</p>
<p>Redpencil.io</p>
`;
}
