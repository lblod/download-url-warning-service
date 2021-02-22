import { querySudo as query, updateSudo as update } from '@lblod/mu-auth-sudo';
import { sparqlEscapeString, sparqlEscapeUri, sparqlEscapeDateTime, uuid } from 'mu';
import {
  PREFIXES,
  SERVICE_NAME,
  JOB_GRAPH,
  EMAIL_GRAPH,
  JOB_URI_PREFIX,
  TASK_URI_PREFIX,
  EMAIL_URI_PREFIX,
  ERROR_URI_PREFIX,
  CONTAINER_URI_PREFIX,
  JOB_TYPE,
  TASK_TYPE,
  STATUS_SCHEDULED,
  JOB_OPERATION,
  OUTBOX,
  WARNING_EMAIL_SUBJECT,
  WARNING_EMAIL_TEXT,
  WARNING_EMAIL_HTML,
  CHECK_FAILED_URL_DOWNLOADS_OPERATION
} from './constants';
import {
  EMAIL_FROM,
  EMAIL_TO
} from './config';

/**
 * Creates a new job in the store
 */
export async function createJob() {
  const jobUuid = uuid();
  const jobUri = `${JOB_URI_PREFIX}${jobUuid}`;
  const now = new Date().toISOString();

  const q = `
    ${PREFIXES}
    INSERT DATA {
      GRAPH ${sparqlEscapeUri(JOB_GRAPH)} {
        ${sparqlEscapeUri(jobUri)} a ${sparqlEscapeUri(JOB_TYPE)} ;
          mu:uuid ${sparqlEscapeString(jobUuid)} ;
          dct:creator ${sparqlEscapeUri(SERVICE_NAME)} ;
          dct:created ${sparqlEscapeDateTime(now)} ;
          dct:modified ${sparqlEscapeDateTime(now)} ;
          task:operation ${sparqlEscapeUri(JOB_OPERATION)} ;
          adms:status ${sparqlEscapeUri(STATUS_SCHEDULED)} .
      }
    }
  `;
  await update(q);
  return jobUri;
}

/**
 * Creates a new task linked to a job in the store
 */
export async function createTask(jobUri) {
  const taskUuid = uuid();
  const taskUri = `${TASK_URI_PREFIX}${taskUuid}`;
  const now = new Date().toISOString();

  const q = `
    ${PREFIXES}
    INSERT DATA {
      GRAPH ${sparqlEscapeUri(JOB_GRAPH)} {
        ${sparqlEscapeUri(taskUri)} a ${sparqlEscapeUri(TASK_TYPE)} ;
          mu:uuid ${sparqlEscapeString(taskUuid)} ;
          dct:created ${sparqlEscapeDateTime(now)} ;
          dct:modified ${sparqlEscapeDateTime(now)} ;
          task:operation ${sparqlEscapeUri(CHECK_FAILED_URL_DOWNLOADS_OPERATION)} ;
          task:index ${sparqlEscapeString("0")} ;
          dct:isPartOf ${sparqlEscapeUri(jobUri)} ;
          adms:status ${sparqlEscapeUri(STATUS_SCHEDULED)} .
      }
    }
  `;
  await update(q);
  return taskUri;
}

/**
 * Updates the status of the given resource
 */
export async function updateStatus(uri, status) {
  const q = `
    ${PREFIXES}
    DELETE {
      GRAPH ?g {
        ${sparqlEscapeUri(uri)} adms:status ?status .
      }
    }
    INSERT {
      GRAPH ?g {
        ${sparqlEscapeUri(uri)} adms:status ${sparqlEscapeUri(status)} .
      }
    }
    WHERE {
      GRAPH ?g {
        ${sparqlEscapeUri(uri)} adms:status ?status .
      }
    }
  `;
  await update(q);
}

/**
 * Gets the urls for which the download failed
 */
export async function getFailedDownloads() {
  const q = `
    ${PREFIXES}
    SELECT DISTINCT ?remoteUrl ?url ?errorCode ?errorLabel
    WHERE {
      GRAPH ?g {
        ?remoteUrl a nfo:RemoteDataObject ;
          adms:status <http://lblod.data.gift/file-download-statuses/failure> ;
          ext:cacheError ?errorLabel ;
          ext:httpStatusCode ?errorCode ;
          nie:url ?url .
      }
      FILTER NOT EXISTS { ?container task:hasRemoteUrl ?remoteUrl . }
    }
  `;

  const result = await query(q);
  return result.results.bindings;
}

/**
 * Creates a warning email in the store and put it in the outbox
 */
export async function createWarningEmail(taskUri, failedDownloads) {
  const containerUuid = uuid();
  const containerUri = `${CONTAINER_URI_PREFIX}${containerUuid}`;
  const emailUuid = uuid();
  const emailUri = `${EMAIL_URI_PREFIX}${emailUuid}`;
  const now = new Date().toISOString();
  const remoteUrls = failedDownloads.map(d => d.remoteUrl.value);
  const urlTriples = remoteUrls.map(url => `${sparqlEscapeUri(containerUri)} task:hasRemoteUrl ${sparqlEscapeUri(url)} .`);

  let urlsBlock = '';
  urlTriples.forEach(triple => urlsBlock = `${urlsBlock}\n\t\t${triple}`);

  const q = `
    ${PREFIXES}
    INSERT DATA {
      GRAPH ${sparqlEscapeUri(JOB_GRAPH)} {
        ${sparqlEscapeUri(taskUri)} task:resultsContainer ${sparqlEscapeUri(containerUri)} .
        ${urlsBlock}
        ${sparqlEscapeUri(containerUri)} task:hasEmail ${sparqlEscapeUri(emailUri)} .     
      }
      GRAPH ${sparqlEscapeUri(EMAIL_GRAPH)} {
        ${sparqlEscapeUri(emailUri)} a nmo:Email ;
          mu:uuid ${sparqlEscapeString(emailUuid)} ;
          nmo:messageFrom ${sparqlEscapeString(EMAIL_FROM)} ;
          nmo:emailTo ${sparqlEscapeString(EMAIL_TO)} ;
          nmo:messageSubject ${sparqlEscapeString(WARNING_EMAIL_SUBJECT)} ;
          nmo:plainTextMessageContent ${sparqlEscapeString(WARNING_EMAIL_TEXT(failedDownloads))} ;
          nmo:htmlMessageContent ${sparqlEscapeString(WARNING_EMAIL_HTML(failedDownloads))} ;
          nmo:sentDate ${sparqlEscapeDateTime(now)} ;
          nmo:isPartOf ${sparqlEscapeUri(OUTBOX)} .
      }
    }
  `;

  const result = await update(q);
}

/**
 * Adds an error resource to the given job
 */
export async function addError(jobUri, error) {
  const errorUuid = uuid();
  const errorUri = `${ERROR_URI_PREFIX}${errorUuid}`;

  const q = `
    ${PREFIXES}
    INSERT DATA {
      GRAPH ${sparqlEscapeUri(JOB_GRAPH)} {
        ${sparqlEscapeUri(jobUri)} task:error ${sparqlEscapeUri(errorUri)} .
        ${sparqlEscapeUri(errorUri)} a oslc:Error ;
          mu:uuid ${sparqlEscapeString(errorUuid)} ;
          oslc:message ${sparqlEscapeString(error)} .
      }
    }
  `;
  await update(q);
}
