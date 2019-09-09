export const EVENT_HANDLER_METADATA: string = 'emitter_event_handler_metadata';
export const EventHandler = (eventName: string) => (
  target,
  key,
) => {
  const handlers = Reflect.getMetadata(EVENT_HANDLER_METADATA, target) || [];

  handlers.push({
    event: eventName,
    handler: key
  });

  Reflect.defineMetadata(EVENT_HANDLER_METADATA, handlers, target);
}
