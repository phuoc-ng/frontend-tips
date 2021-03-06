const { DateTime } = require('luxon');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const markdownIt = require('markdown-it');
const minify = require('html-minifier').minify;

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginSyntaxHighlight);
    eleventyConfig.addPlugin(pluginNavigation);

    eleventyConfig.addPassthroughCopy('img');
    eleventyConfig.addPassthroughCopy('css');

    eleventyConfig.addWatchTarget('./css/');

    let markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
    });
    eleventyConfig.setLibrary('md', markdownLibrary);

    eleventyConfig.addCollection('posts', (collection) => {
        const posts = collection.getFilteredByTag('posts');
      
        for(let i = 0; i < posts.length; i++) {
            posts[i].data['index'] = i;
            posts[i].data['prevPost'] = i === 0 ? null : posts[i - 1];
            posts[i].data['nextPost'] = i === posts.length - 1 ? null : posts[i + 1];
        }
      
        return posts;
    });

    eleventyConfig.addPairedShortcode('callout', (content) => (
		`<div class='post__callout'>${markdownLibrary.render(content.trim())}</div>`
    ));

    eleventyConfig.addFilter('sitemapDateTimeString', (dateObj) => {
        const dt = DateTime.fromJSDate(dateObj, { zone: 'utc' });
        return !dt.isValid ? '' : dt.toISO();
    });

    eleventyConfig.addFilter('prefixZeros', (number, max) => {
        return String(number).padStart(`${max}`.length, '0');
    });

    // Minify HTML
    const minifyHtml = (rawContent, outputPath) => (
        (outputPath && outputPath.endsWith('.html'))
            ? minify(rawContent, {
                removeAttributeQuotes: true,
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeComments: true,
                sortClassName: true,
                sortAttributes: true,
                html5: true,
                decodeEntities: true,
                removeOptionalTags: true,
            })
            : rawContent
    );

    eleventyConfig.addTransform("minifyHtml", minifyHtml);

    return {
        templateFormats: ['md', 'njk', 'html', 'liquid'],
        markdownTemplateEngine: 'liquid',
        htmlTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',

        dir: {
            input: '.',
            includes: '_includes',
            data: '_data',
            output: '_site',
        },
    };
};
