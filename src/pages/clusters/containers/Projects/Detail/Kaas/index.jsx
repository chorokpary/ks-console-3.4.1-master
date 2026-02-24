import React from 'react'
import { observer, inject } from 'mobx-react'
import DetailKaasList from 'pages/clusters/containers/Resources/components/DetailKaasList'

@inject('detailStore')
@observer
export default class Kaas extends React.Component {
  store = this.props.detailStore

  render() {
    const { cluster, namespace } = this.props.match.params

    return (
      <DetailKaasList type={t(namespace)} variables="project" name={namespace} />
    )
  }
}
