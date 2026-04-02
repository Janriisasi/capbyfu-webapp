// Church data — passwords are stored in Supabase, this is just the static list
export const CHURCHES = [
  // Circuit A (11 churches)
  { id: 'agbatuan',           name: 'Agbatuan Baptist Church',                          circuit: 'A' },
  { id: 'astorga',            name: 'Astorga Baptist Church Inc',                       circuit: 'A' },
  { id: 'east_villaflores',   name: 'East Villaflores Evangelical Church',              circuit: 'A' },
  { id: 'hansol',             name: 'Hansol Baptist Church',                            circuit: 'A' },
  { id: 'hilltop',            name: 'Hilltop Baptist Church',                           circuit: 'A' },
  { id: 'lunayan',            name: 'Lunayan Baptist Church',                           circuit: 'A' },
  { id: 'mahunodhunod',       name: 'Mahunodhunod Baptist Church',                      circuit: 'A' },
  { id: 'pamampangon',        name: 'Pamampangon Baptist Church',                       circuit: 'A' },
  { id: 'putian_community',   name: 'Puti-an Community Christian Church',               circuit: 'A' },
  { id: 'putian_evangelical', name: 'Puti-an Evangelical Church',                       circuit: 'A' },
  { id: 'san_antonio',        name: 'San Antonio Baptist Church',                       circuit: 'A' },

  // Circuit B (24 churches)
  { id: 'aglalana',           name: 'Aglalana Baptist Mission Church',                  circuit: 'B' },
  { id: 'agsilab',            name: 'Agsilab Baptist Church',                           circuit: 'B' },
  { id: 'amaga',              name: 'Amaga Evangelical Church',                         circuit: 'B' },
  { id: 'bago_chiquito',      name: 'Bago Chiquito Christian Church',                   circuit: 'B' },
  { id: 'balid_evangelical',  name: 'Balud Evangelical Church (Balud, Masbate)',        circuit: 'B' },
  { id: 'capiz_evangelical',  name: 'Capiz Evangelical Church',                         circuit: 'B' },
  { id: 'cec_maayon_bal',     name: 'CEC Maayon (Balighot)',                            circuit: 'B' },
  { id: 'cec_maayon_fer',     name: 'CEC Maayon (Fernandez)',                           circuit: 'B' },
  { id: 'cec_milibili',       name: 'CEC Milibili',                                     circuit: 'B' },
  { id: 'cec_pinaypayan',     name: 'CEC (Pinaypayan)',                                 circuit: 'B' },
  { id: 'christ_centered',    name: 'Christ Centered Church',                           circuit: 'B' },
  { id: 'dapadpan',           name: 'Dapadpan Baptist Church',                          circuit: 'B' },
  { id: 'hope_community',     name: 'Hope Community Baptist Church',                    circuit: 'B' },
  { id: 'lucero',             name: 'Lucero Baptist Church',                            circuit: 'B' },
  { id: 'malibas',            name: 'Malibas Baptist Church (Balud, Masbate)',          circuit: 'B' },
  { id: 'manhoy',             name: 'Manhoy Baptist Church',                            circuit: 'B' },
  { id: 'nasagud',            name: 'Nasagud Evangelical Church',                       circuit: 'B' },
  { id: 'nipa',               name: 'Nipa Baptist Church',                              circuit: 'B' },
  { id: 'paglaum',            name: 'Paglaum Baptist Church',                           circuit: 'B' },
  { id: 'pajo',               name: 'Pajo Baptist Church (Balud, Masbate)',             circuit: 'B' },
  { id: 'pontevedra',         name: 'Pontevedra Baptist Church Inc.',                   circuit: 'B' },
  { id: 'senores_memorial',   name: 'Rev. Leocadio Señeres Memorial Baptist Church',   circuit: 'B' },
  { id: 'sublangon',          name: 'Sublangon Christian Church',                       circuit: 'B' },
  { id: 'tinaytayan',         name: 'Tinaytayan Baptist Church',                        circuit: 'B' },

  // Circuit C (23 churches)
  { id: 'aglungon',           name: 'Aglungon Baptist Church',                          circuit: 'C' },
  { id: 'bag_ong_barrio',     name: 'Bag-ong Barrio Baptist Church',                    circuit: 'C' },
  { id: 'camburanan',         name: 'Camburanan Baptist Church',                        circuit: 'C' },
  { id: 'christ_centered_c',  name: 'Christ Centered Church',                           circuit: 'C' },
  { id: 'dumalag',            name: 'Dumalag Evangelical Church',                       circuit: 'C' },
  { id: 'duran',              name: 'Duran Baptist Church',                             circuit: 'C' },
  { id: 'faith_christian',    name: 'Faith Christian Church',                           circuit: 'C' },
  { id: 'garangan',           name: 'Garangan Baptist Church',                          circuit: 'C' },
  { id: 'greenhills',         name: 'Greenhills Christian Church',                      circuit: 'C' },
  { id: 'hopevale',           name: 'Hopevale Baptist Church',                          circuit: 'C' },
  { id: 'katipunan',          name: 'Katipunan Evangelical Church',                     circuit: 'C' },
  { id: 'libertad',           name: 'Libertad Baptist Church',                          circuit: 'C' },
  { id: 'malitbog',           name: 'Malitbog Baptist Church',                          circuit: 'C' },
  { id: 'maludlud',           name: 'Maludlud Christian Church',                        circuit: 'C' },
  { id: 'romaje',             name: 'Romaje Baptist Church',                            circuit: 'C' },
  { id: 'san_francisco',      name: 'San Francisco Baptist Church',                     circuit: 'C' },
  { id: 'san_miguel',         name: 'San Miguel Baptist Church',                        circuit: 'C' },
  { id: 'sta_teresa',         name: 'Sta. Teresa Evangelical Church',                   circuit: 'C' },
  { id: 'sunrise',            name: 'Sunrise Baptist Church',                           circuit: 'C' },
  { id: 'switch',             name: 'Switch Baptist Church',                            circuit: 'C' },
  { id: 'taft',               name: 'Taft Evangelical Church',                          circuit: 'C' },
  { id: 'tapaz',              name: 'Tapaz Baptist Church',                             circuit: 'C' },
  { id: 'wright',             name: 'Wright Baptist Church',                            circuit: 'C' },

  // Visiting
  { id: 'visiting',           name: 'Visiting Church',                                  circuit: 'Visiting' },
];

export const CHURCH_BY_ID = CHURCHES.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

export const ROLES = ['Camper', 'Facilitator', 'Camp Staff', 'Guardian', 'Pastor'];
export const SHIRT_SIZES = ['Extra Small', 'Small', 'Medium', 'Large', 'Extra Large', 'XXL'];
export const SHIRT_COLORS = ['White', 'Black', 'Navy Blue', 'Forest Green', 'Maroon', 'Gray'];
export const PAYMENT_METHODS = ['GCash', 'GoTyme'];
export const ANNOUNCEMENT_CATEGORIES = ['News', 'Blog', 'Event', 'Announcement'];