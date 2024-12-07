export default {
  paths: {
    "/auth/register": {
      get: {
        summary: "Get all users",
        responses: {
          200: {
            description: "List of users",
          },
        },
      },
    },
  },
};
