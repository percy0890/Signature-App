import React, { useState } from 'react';
import './Signature.css';
import SignaturePad from 'signature_pad';


function Signature() {
  let signaturePad;
  const [tab, setTab] = useState('type')
  const [signType, setSignType] = useState('')
  const [file, setFile] = useState(null)


  function debounce(fun, t) {
    let id;
    return function (e) {
      e.persist();
      id && clearTimeout(id);
      id = setTimeout(() => {
        fun(e)
      }, t)
    }
  }


  function onChange(e) {
    setSignType(e.target.value);
  }


  function SignatureType() {
    return (
      <input
        type="text"
        defaultValue={signType}
        className="signature-type"
        onChange={debounce(onChange, 600)}
      />
    )
  }


  function onFileChange(e) {
    let f = e.target.files[0];
    setFile(f)
    let reader = new FileReader();

    reader.onload = (function (file) {
      return function (e) {
        document.getElementById('list').innerHTML =
          ['<img src="', e.target.result, '" title="', file.name, '" width="150" />'].join('');
      };
    })(f);

    reader.readAsDataURL(f);
  }


  function SignatureUpload() {
    return (
      <>
        <input
          type='file'
          onChange={e => onFileChange(e)}
          className="file-input"
          accept="image/*"
        />
        <output id="list"></output>
      </>
    )
  }


  function getSignaturePad() {
    setTimeout(() => {
      const canvas = document.getElementById('signature-pad');
      signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)' // necessary for saving image as JPEG; can be removed is only saving as PNG or SVG
      });
    }, 0)
  }


  function SignatureDraw() {
    getSignaturePad()
    return (
      <div className="wrapper">
        <canvas id="signature-pad" className="signature-pad" width='950' height='320'></canvas>
      </div >
    )
  }


  function changeTab(tabType) {
    setTab(tabType);
    setSignType('');
    setFile(null);
  }


  function onSubmmit() {
    const fd = new FormData();


    function submitType() {
      if (!signType) {
        return alert("Please provide a signature first.");
      }
      fd.append('type', signType);
      serverCall()
    }


    function submitUpload() {
      if (!file) {
        return alert("Please provide a signature first.");
      }
      fd.append('file', file);
      serverCall()
    }


    function submitDraw() {
      if (signaturePad && signaturePad.isEmpty()) {
        return alert("Please provide a signature first.");
      }
      var data = signaturePad.toDataURL('image/svg+xml');
      fd.append('draw', data);
      serverCall()
    }


    function serverCall() {
      var request = new XMLHttpRequest();
      request.open("POST", "https://httpbin.org/post");
      request.send(fd);
    }


    switch (tab) {
      case 'type':
        submitType();
        break;
      case 'upload':
        submitUpload();
        break;
      case 'draw':
        submitDraw();
        break;
      default:
    }
  }


  function onClear() {
    setSignType('');
    setFile(null);
    signaturePad && signaturePad.clear();
  }


  return (
    <div className="container">
      <header className="header">Create a Signature</header>
      <div className="instruction">Use one of the following ways to create your signature</div>
      <div className="tabs">
        <div className={tab === 'type' ? 'tab selected' : 'tab'} onClick={() => changeTab('type')}>Type</div>
        <div className={tab === 'upload' ? 'tab selected' : 'tab'} onClick={() => changeTab('upload')}>Upload</div>
        <div className={tab === 'draw' ? 'tab selected' : 'tab'} onClick={() => changeTab('draw')}>Draw</div>
      </div>
      <div className="signature">
        {tab === 'type' ? <SignatureType /> : null}
        {tab === 'upload' ? <SignatureUpload /> : null}
        {tab === 'draw' ? <SignatureDraw /> : null}
      </div>
      <div className="action-btns">
        <button onClick={onSubmmit}>Submit</button>
        <button onClick={onClear}>Clear</button>
      </div>
    </div>
  );
}


export default Signature;
