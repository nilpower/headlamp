/* Note: This code is taken from https://github.com/cheton/is-electron/blob/master/index.js
   Licence: MIT
*/
// helper method to determine whether app is running in electron environment
export function isElectron(): boolean {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' && (window.process as any).type === 'renderer') {
    return true;
  }

  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!(process.versions as any).electron) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}

export function getFilterValueByNameFromURL(key: string, location: any,
                                            isGlobalFilter: boolean = false): string[] {
  const searchParams = new URLSearchParams(location.search);
  const filtersInURLString = searchParams.get(isGlobalFilter ? key : 'filters');
  if (!filtersInURLString) {
    return [];
  }
  if (isGlobalFilter) {
    return filtersInURLString.split(',');
  }
  const filterObjStringArray = filtersInURLString.split(';');

  for (const filterStr of filterObjStringArray) {
    const filterPropertyArr = filterStr.split('=');
    if (filterPropertyArr[0] === key) {
      return filterPropertyArr[1].split(',');
    }
  }
  return [];
}

export function addQuery(queryObj: {[key: string]: string},
                         queryParamDefaultObj:{[key: string]: string} = {}, history:any,
                         location: any, tableName = '', isGlobalFilter: boolean = false) {
  const filters: any = {};
  if (tableName) {
    filters['tableName'] = tableName;
  }
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const filtersInURLString = searchParams.get('filters');
  if (!!filtersInURLString) {
    const filterObjStringArray = filtersInURLString.split(';');
    filterObjStringArray.forEach((filterStr) => {
      const filterPropertyArr = filterStr.split('=');
      filters[filterPropertyArr[0]] = filterPropertyArr[1];
    });
  }

  // Ensure that default values will not show up in the URL
  for (const key in queryObj) {
    const value = queryObj[key];
    if (value !== queryParamDefaultObj[key]) {
      if (isGlobalFilter) {
        searchParams.set(key, value);
      } else {
        filters[key] = value;
      }
    } else {
      if (isGlobalFilter) {
        searchParams.delete(key);
      } else {
        filters[key] = null;
      }
    }
  }

  let filterString = '';
  for (const key in filters) {
    if (filters[key]) {
      filterString += `${key}=${filters[key]};`;
    }
  }

  if (!!filterString) {
    searchParams.set('filters', filterString);
  } else {
    searchParams.delete('filters');
  }

  history.push({
    pathname: pathname,
    search: searchParams.toString()
  });
};
