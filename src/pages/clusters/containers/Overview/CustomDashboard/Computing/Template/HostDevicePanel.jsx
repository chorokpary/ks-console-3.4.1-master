import React, { useEffect, useState } from 'react'

const Panel = ({ hd }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-hostdevice"></i>호스트 디바이스</h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{hd.used}</span> / {hd.used + hd.unused}</p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{hd.used}</div>
                            <p className="status used"><span>Used</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{hd.unused}</div>
                            <p className="status unused"><span>Unused</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel