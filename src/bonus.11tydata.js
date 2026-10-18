// The hidden page lives at a path derived from the secret sequence, or isn't built at all.
export default {
  eleventyExcludeFromCollections: true,
  eleventyComputed: {
    permalink: (data) => (data.bonus?.enabled ? `/${data.bonus.slug}/` : false),
  },
};
