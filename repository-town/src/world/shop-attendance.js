// A roster is not proof of presence: council work can send somebody elsewhere.
export function workingAt(worker, siteId) {
  return worker?.step?.kind === 'work' &&
    worker.step.at === siteId && !(worker.path?.length);
}
