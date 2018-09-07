import {assert} from 'chai';
import * as fs from 'fs';
import * as path from 'path';

import {addTheory, resetTheories, Transform, TransformTheory} from '../lib/smalldata';
import { write } from 'fs';

let geocoder: { geocode: (addr: string) => Promise<any> } | undefined = undefined;

function geocode(addr: string): Promise<any> {
  if (!geocoder) {
    const NodeGeocoder = require('node-geocoder');
    geocoder = NodeGeocoder({
      provider: 'datasciencetoolkit',
      httpAdapter: 'http',
    });
  }
  return geocoder!.geocode(addr);
}

async function cachedGeocode(addr: string, directory: string, write: boolean): Promise<any> {
  console.log("GEOCODE", addr);
  const key = addr.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fname = path.resolve(directory, key + ".json");
  let data: any = undefined;
  try {
    fs.statSync(fname);
    data = JSON.parse(fs.readFileSync(fname, 'utf-8'));
  } catch(err) {
    if(err.code !== 'ENOENT') {
      throw err;
    }
  }
  if (!data) {
    data = await geocode(addr);
    fs.writeFileSync(fname, JSON.stringify(data, null, 2));
  }
  return data || {};
}

/*
function weakGeocode(addr: string, directory: string): any {
  const key = String(addr).toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fname = path.resolve(directory, key + ".json");
  let data: any = undefined;
  try {
    fs.statSync(fname);
    data = JSON.parse(fs.readFileSync(fname, 'utf-8'));
  } catch(err) {
    if(err.code !== 'ENOENT') {
      throw err;
    }
  }
  const result = (data || [])[0];
  return result;
}
*/

const addrs = 
  [{
    address: '305 Memorial Dr, Cambridge MA',
    city: "Cambridge",
  }, {
    address: '101 6th Ave, New York NY',
    city: "New York",
  }, {
    address: '1600 Pennsylvania Avenue, NW Washington, DC 20500',
    city: "Washington",
  }, {
    address: '193 Home Farm Way, Waitsfield, VT 05673',
    city: "Waitsfield",
  }];

const cacheDir = 'test/fixtures/geo';

beforeEach(() => {
  resetTheories();
});

describe("geocoding", () => {

  it("has geocoded data", async () => {
    for (const addr of addrs.map(a => a.address)) {
      const data = await cachedGeocode(addr, cacheDir, true);
      assert.containsAllKeys(data[0], ['city', 'state', 'country']);
    }
  });

  it("spots direct use of geocoded fields", async () => {
    const samples = addrs.map(a => [a, a.city] as [any, any]);
    const tr = new Transform(samples.slice(0, 3));
    const test = samples.slice(3, addrs.length);
    const result = await tr.apply(test.map(eg => eg[0]));
    assert.deepEqual(result, test.map(eg => eg[1]));
  });

  it("spots indirect use of geocoded fields", async () => {
    
    addTheory(() => new TransformTheory({
      async transform(input) {
        return {
          value: await cachedGeocode(input.value, cacheDir, true),
          context: Object.assign(input.context || {}, {geocoded: true})
        };
      },
      relevant(input) {
        if (input.context && input.context['geocoded']) { return false; }
        if (input.context && input.context['fragmented']) { return false; }
        return typeof input.value === 'string' && input.value.length >= 6;
      }
    }));
    const samples = addrs.map(a => [a.address, a.city] as [string, string]);
    const tr = new Transform(samples.slice(0, 3));
    const test = samples.slice(3, addrs.length);
    const result = await tr.apply(test.map(eg => eg[0]));
    assert.deepEqual(result, test.map(eg => eg[1]));
  });

});

