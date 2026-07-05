import MarkdownIt from 'markdown-it';
import multimdTable from 'markdown-it-multimd-table';
import { figure } from '@mdit/plugin-figure';
import { imgLazyload } from '@mdit/plugin-img-lazyload';
import { tab } from '@mdit/plugin-tab';
import GithubAnchor from '../libs/markdown/GithubAnchor.js';
import TableOfContent from '../libs/markdown/TableOfContent.js';
import AdmonitionContainer from '../libs/markdown/AdmonitionContainer.js';
import MacCodeBlock from '../libs/markdown/MacCodeBlock.js';
import MultiMediaPlayer from '../libs/markdown/MultiMediaPlayer.js';
import HighlightBacktick from '../libs/markdown/HighlightBacktick.js';
import Tabs from '../libs/markdown/Tabs.js';
import Dokapi from '../libs/markdown/Dokapi.js';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false
});

// Register plugins in specified order
md.use(HighlightBacktick);
md.use(MultiMediaPlayer);
md.use(GithubAnchor);
md.use(TableOfContent);
md.use(multimdTable, { multiline: true, rowspan: true, headerless: true });
md.use(AdmonitionContainer);
md.use(MacCodeBlock);
md.use(figure);
md.use(imgLazyload);
md.use(tab);
md.use(Dokapi);
md.use(Tabs);

export { md };
