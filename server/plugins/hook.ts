export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('error', (error, { event }) => {
    console.log({
      error: error,
      event: event,
    });
  });
});
