import React from 'react';

export function fnFormatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function fnTransformBrtag(descriptionData) {
    return descriptionData.replaceAll("<br/>", "\n");
}

export function fnNewlineTransformOutput(descriptionData) {
    if (descriptionData) {
        if (!descriptionData.includes("<br/>")) {
            return <p style={{ whiteSpace: 'pre-wrap' }}>{descriptionData}</p>;
        }

        const description = descriptionData.split("<br/>").map((data, idx) => (
            <p key={idx} style={{ whiteSpace: 'pre-wrap' }}>{data}</p>
        ));
        return description;
    } else {
        return descriptionData;
    }

}

export function fnSetBytes(size) {
    const gibSize = size / 1024;
    return (0 < gibSize && gibSize < 1) ? gibSize.toFixed(1) : gibSize;
}

export function fnNewlineTransformInput(descriptionData) {
    return descriptionData.replaceAll("\n", "<br/>");
}

// cidr 계산기
export function fnCalculateCidr(cidr, withGw) {
    const bit = cidr.split("/")[1];
    const octet = cidr.split("/")[0].split(".");

    var divide = 32 - bit;
    var cnt = 0;
    while (divide > 8) {
        divide -= 8;
        cnt++;
    }
    const wildcard = Math.pow(2, divide);

    const target = 3 - cnt;
    const targetOctet = octet[target];

    var startIp;
    var endIp;
    for (var i = 0; i < 255; i += wildcard) {
        if (i + wildcard - 1 >= targetOctet && targetOctet >= i) {
            startIp = i;
            endIp = i + wildcard - 1;
            break;
        }
    }

    const st = octet.map((el, idx) => (
        idx == target ? startIp : idx > target ? 0 : Number(el)
    ))
    const ed = octet.map((el, idx) => (
        idx == target ? endIp : idx > target ? 255 : Number(el)
    ))

    const data = {
        startIp: st[0] + "." + st[1] + "." + st[2] + "." + (st[3] + 2),
        endIp: ed[0] + "." + ed[1] + "." + ed[2] + "." + (ed[3] === 255 ? 254 : ed[3]),
        gatewayIp: withGw ? st[0] + "." + st[1] + "." + st[2] + "." + (st[3] + 1) : '',
    }

    return data;
}

export function fnAddCommar(price) {
    let returnString = price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return returnString;
}