export default function GithubAnchor(md) {

    const slugCount = {};

    md.renderer.rules.heading_open = function (tokens, idx) {

        const token = tokens[idx];
        const level = Number(token.tag.substring(1));

        const inline = tokens[idx + 1];
        const text = inline?.content ?? "";

        let slug = text
            .trim()
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

        if (!slug)
            slug = "section";

        if (slugCount[slug]) {
            slugCount[slug]++;
            slug += "-" + slugCount[slug];
        } else {
            slugCount[slug] = 1;
        }

        token.attrSet("id", slug);

        return `
<h${level}
id="${slug}"
class="group relative scroll-mt-24">
<a
href="#${slug}"
aria-label="Link ke ${text}"
class="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 transition text-lime-500 dark:text-lime-400"
>
<svg xmlns="http://www.w3.org/2000/svg"
width="18"
height="18"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round">
<path d="M10 13a5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 7l-1.5 1.5"/>
<path d="M14 11a5 5 0 0 1 0 7l-2 2a5 5 0 0 1-7-7L6.5 11.5"/>
</svg>
</a>
`;
    };

    md.renderer.rules.heading_close = function(tokens, idx) {
        return `</${tokens[idx].tag}>`;
    };

}