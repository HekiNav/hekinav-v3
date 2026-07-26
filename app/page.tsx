"use client"
import { Map } from '@vis.gl/react-maplibre';
import {} from "@material-symbols-svg/react"
import 'maplibre-gl/dist/maplibre-gl.css';

import InputField from './components/inputfield';

export default function Home() {
  return (
    <main className="w-full h-full flex md:flex-row">
      <div className="absolute bottom-0 left-5 right-5 h-40 z-100 bg-white rounded-t-2xl shadow-[0_0_10px_#0008] p-4
       md:static md:h-full md:w-160 md:rounded-none">
          <h1 className='text-black'><img src="/logo_full.svg" alt="Hekinav Logo" /></h1>
          <InputField name='origin' icon={{children: Pin}}></InputField>
      </div>
      <Map
        initialViewState={{
          longitude: 24.94,
          latitude: 60.18,
          zoom: 13
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="/map_style.json"
      />
    </main>
  );
}
