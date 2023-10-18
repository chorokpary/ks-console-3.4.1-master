import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const ComputingTemplate = () => {

  return (
    <>
      <div className="grid-stack-item" gs-x="0" gs-y="25" gs-w="9" gs-h="4">
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title">
              <label>컴퓨팅 템플릿 현황</label>
              <div className="right">
                {/* <i className="ico-btn-trash"></i> */}
              </div>
            </div>
            <div className="grid_info style_status box_nth">

              <div className="box type_status">
                <h5><i className="ico-type24-mediatedvgpu"></i>Mediated 디바이스</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">4</span> / 5</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">4</div>
                      <p className="status used"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status unused"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico-type24-hostdevice"></i>Host 디바이스</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">2</span> / 3</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">2</div>
                      <p className="status used"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status unused"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico-type24-image"></i>이미지</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">2</span> / 3</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">2</div>
                      <p className="status used"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status unused"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico-type24-keypair"></i>키페어</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">4</span> / 7</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">7</div>
                      <p className="status used"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status unused"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico-type24-flavor"></i>Flavor</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">4</span> / 5</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">4</div>
                      <p className="status used"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status unused"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico-type24-kaasimage"></i>KaaS 이미지</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">7</span> / 8</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">7</div>
                      <p className="status used"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status unused"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ComputingTemplate