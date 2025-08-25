import type { PostFilter } from "./utils/posts";

export interface SiteConfig {
  title: string;
  slogan: string;
  description?: string;
  site: string,
  social: {
    github?: string;
    linkedin?: string;
    email?: string;
    rss?: boolean;
  };
  homepage: PostFilter;
  googleAnalysis?: string;
  search?: boolean;
}

export const siteConfig: SiteConfig = {
  site: "https://ziad626.github.io", // your site url
  title: "Ziad686",
  slogan: "Exploit Code Not People",
  description: "CTF Player / Exploit Developer / Mont5ab El2hwa / Forsan / DraftOps / 403 Brain access denied ",
  social: {
    github: "https://github.com/ziad626", // leave empty if you don't want to show the github
    email: "zeyadsalah686@gmail.com", // leave empty if you don't want to show the email
    rss: false, // set this to false if you don't want to provide an rss feed
  },
  homepage: {
    maxPosts: 5,
    tags: ["ctf", "tutorial", "binary exploitation", "pwn", "reverse", "osint", "crypto", "exploit development"],
    excludeTags: [],
  },
  googleAnalysis: "", // your google analysis id
  search: true, // set this to false if you don't want to provide a search feature
};
