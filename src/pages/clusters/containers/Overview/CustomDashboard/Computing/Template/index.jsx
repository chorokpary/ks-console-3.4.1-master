import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import MediatedDevicePanel from './MediatedDevicePanel'
import HostDevicePanel from './HostDevicePanel'
import ImagePanel from './ImagePanel'
import KeypairPanel from './KeypairPanel'
import FlavorPanel from './FlavorPanel'
import KaasPanel from './KaasPanel'

const ComputingTemplate = ({
  loading,
  vmList,
  imageList,
  flavorList,
  flavorDetailList,
  hdList,
  mdList,
  keypairList,
  kaasList,
  kaasIamgeList,
  x,
  y,
  w,
  h,
}) => {
  const [hd, setHd] = useState({ used: 0, unused: 0 })
  const [md, setMd] = useState({ used: 0, unused: 0 })
  const [image, setImage] = useState({ used: 0, unused: 0 })
  const [keypair, setKeypair] = useState({ used: 0, unused: 0 })
  const [flavor, setFlavor] = useState({ used: 0, unused: 0 })
  const [kaas, setKaas] = useState({ used: 0, unused: 0 })

  useEffect(() => {
    if (flavorDetailList.length > 0) {
      let hdUsed = 0
      var hdSet = new Set() // device

      let mdUsed = 0
      var mdSet = new Set() // gpu
      flavorDetailList.map(obj => {
        obj['flavor'].devices.map(el => {
          hdSet.add(el.name)
        })
        obj['flavor'].gpus.map(el => {
          mdSet.add(el.name)
        })
      })
      hdList?.map(obj => {
        hdSet.has(obj.name) ? hdUsed++ : ''
      })
      setHd({ used: hdUsed, unused: hdList.length - hdUsed })

      mdList?.map(obj => {
        mdSet.has(obj.resource_name) ? mdUsed++ : ''
      })
      setMd({ used: mdUsed, unused: mdList.length - mdUsed })
    }
  }, [hdList, mdList, flavorDetailList])

  useEffect(() => {
    if (imageList.length > 0) {
      let used = 0
      var imageSet = new Set()
      vmList?.map(obj => {
        imageSet.add(obj.image)
      })
      imageList.map(obj => {
        imageSet.has(obj.name) ? used++ : ''
      })
      setImage({ used, unused: imageList.length - used })
    }
  }, [imageList, vmList])

  useEffect(() => {
    if (keypairList.length > 0) {
      let used = 0
      var keypairSet = new Set()
      vmList?.map(obj => {
        keypairSet.add(obj.keypair_object?.name)
      })
      keypairList.map(obj => {
        keypairSet.has(obj.name) ? used++ : ''
      })
      setKeypair({ used, unused: keypairList.length - used })
    }
  }, [keypairList, vmList])

  useEffect(() => {
    if (flavorList.length > 0) {
      let used = 0
      var flavorSet = new Set()
      vmList?.map(obj => {
        flavorSet.add(obj.flavor)
      })
      flavorList.map(obj => {
        flavorSet.has(obj.name) ? used++ : ''
      })
      setFlavor({ used, unused: flavorList.length - used })
    }
  }, [flavorList, vmList])

  useEffect(() => {
    let used = 0
    var kaasSet = new Set()
    kaasList?.map(obj => {
      kaasSet.add(obj.kube_image)
    })
    kaasIamgeList?.map(obj => {
      kaasSet.has(obj.name) ? used++ : ''
    })
    setKaas({ used, unused: kaasIamgeList.length - used })
  }, [kaasList, kaasIamgeList])

  return (
    <>
      {/* <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content"> */}
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_COMPUTING_TEMPLATE_CURRENT_SITUATION')}</label>
          <div className="right">{/* <i className="ico-btn-trash"></i> */}</div>
        </div>
        <Loading spinning={loading}>
          <div className="grid_info style_status box_nth">
            <ImagePanel image={image} />
            <KaasPanel kaas={kaas} />
            <FlavorPanel flavor={flavor} />
            <KeypairPanel keypair={keypair} />
            <HostDevicePanel hd={hd} />
            <MediatedDevicePanel md={md} />
          </div>
        </Loading>
      </div>
      {/* </div>
      </div> */}
    </>
  )
}

export default ComputingTemplate
