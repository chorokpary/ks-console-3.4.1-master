import { getIndexRoute } from 'utils/router.config'

import Status from 'clusters/containers/Resources/Licenses/Detail/Status'

const PATH = '/clusters/:cluster/licenses/:name'

export default [
  {
    path: `${PATH}/status`,
    title: t('RESOURCES_STATE'),
    component: Status,
    exact: true,
  },
  getIndexRoute({ path: PATH, to: `${PATH}/status`, exact: true }),
]