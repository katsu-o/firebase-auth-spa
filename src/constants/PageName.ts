enum PageName {
  TOP = '/',
  SIGNIN = '/signin',
  HOME = '/home',
}

export const toPublicUrl = (page: PageName, ...params: []) => {
  const suffix: string = params.length > 0 ? `/${params.join('/')}` : '';
  return process.env.PUBLIC_URL + page + suffix;
};

export default PageName;
