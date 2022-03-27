// FARM RATE - from 1 kex per 1 day
export const DAILY_FARM_RATE = 1;
export const BASE_URL = process.env.REACT_APP_BASE_URL ? String(process.env.REACT_APP_BASE_URL) : "kira.network";
export const HEADER_MENUS = [
  { label: 'ABOUT', href: `https://${BASE_URL}/about.html` },
  { label: 'TECHNOLOGY', href: `https://${BASE_URL}/technology.html` },
  { label: 'NFT', href: '/', active: true },
  { label: 'TEAM', href: `https://${BASE_URL}/team.html` },
  { label: 'BLOG', href: `https://${BASE_URL}/blog.html` },
  { label: 'CAREERS', href: `https://${BASE_URL}/careers.html` }
]