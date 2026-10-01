# DadLAN Canonical Fleet, Steam Accounts and Storage — 1 October 2026

This is the corrected canonical DadLAN inventory established from Action1, prior DadLAN records, and direct hardware verification on 1 October 2026.

## Action1 fleet

Action1 currently has 16 managed endpoints: JParrisDesktop plus Laptop #01 through Laptop #15.

| ID | Machine | Action1 / hostname | Notes |
|---|---|---|---|
| Desktop | JParrisDesktop | JPARRISDESKTOP | Main desktop |
| #01 | HP ProBook x360 435 G8 | DESKTOP-5C3NIQO | |
| #02 | Lenovo ThinkPad L480 | DESKTOP-RHHL0GI | |
| #03 | Toshiba Satellite L850D | DESKTOP-1M0IVQE | shorthand: Toshiba20 |
| #04 | HP ProBook 4230s | DESKTOP-T011TJ5 | shorthand: HP10 |
| #05 | Toshiba Tecra P11 | DESKTOP-KTB33OI | shorthand: Toshiba01 |
| #06 | Toshiba Satellite L630 | DESKTOP-BRCVC4U | |
| #07 | ASUS X553MA / F553M | DESKTOP-KBETS0I | user joshu; separate physical machine from #12 |
| #08 | Toshiba Satellite C50D-A | DESKTOP-6VO4N54 | |
| #09 | Compaq Presario CQ56 | DESKTOP-43NG4PS | |
| #10 | Compaq 610 | DESKTOP-MMR0H5N | not one of the current 15 Steam machines |
| #11 | HP ProBook 11 EE G2 | DESKTOP-CD1U980 | |
| #12 | Toshiba Satellite L50-A | DESKTOP-KBETS0I | user joshu_mafonmb; duplicate hostname with #07 |
| #13 | Lenovo 7567Y2M desktop | DADLAN-GUEST1 | shorthand: Lenovo06 |
| #14 | Early-2015 MacBook Air | Kristys-MacBook-Air.local | macOS |
| #15 | 2017 iMac Retina 5K 27-inch | apple.local | macOS |

## Confirmed shorthand mappings

- Lenovo06 = Laptop #13 Lenovo 7567Y2M desktop.
- Toshiba01 = Laptop #05 Toshiba Tecra P11.
- HP10 = Laptop #04 HP ProBook 4230s.
- Toshiba20 = Laptop #03 Toshiba Satellite L850D.
- F553M = Laptop #07 ASUS X553MA.
- Satellite L50A = Laptop #12 Toshiba Satellite L50-A.

## Steam mapping

There are 15 active DadLAN gaming computers logged into 15 different Steam accounts.

| # | Computer | Steam account |
|---|---|---|
| 1 | JPARRISDESKTOP | samuellewiswalker |
| 2 | iMac 2017 | joshlukeparris |
| 3 | ProBook x360 | joshualukeparris |
| 4 | ThinkPad L480 | joshuaparris |
| 5 | Satellite L50-A | kristyparris |
| 6 | Lenovo06 | dcscosanostra |
| 7 | Toshiba01 | glennpeterson86 |
| 8 | Toshiba Satellite L630 | joshuascool2 |
| 9 | F553M / ASUS X553MA | matthewjohnlucaswalker |
| 10 | HP10 | janecarbunkle |
| 11 | Toshiba20 / L850D | topsecretcheese |
| 12 | ProBook 11 G2 | dcscomputing2010 |
| 13 | Early-2015 MacBook Air | jar32798 |
| 14 | C50D-A | cornerstoneswanhill |
| 15 | Compaq Presario CQ56 | sylvieparris |

Spare Steam accounts for future machines #16 and #17:

- Joshuaparrisdadlan
- parristechservices

## Current Steam-machine storage

As of 1 October 2026, 12 of the 15 active Steam machines are confirmed SSD-equipped.

| Computer | Storage |
|---|---|
| JPARRISDESKTOP | SSD + 1 TB HDD |
| iMac 2017 | HDD |
| HP ProBook x360 435 G8 | SSD |
| ThinkPad L480 | SSD |
| Toshiba Satellite L50-A | SSD |
| Lenovo06 / Lenovo 7567Y2M | SSD |
| Toshiba01 / Tecra P11 | SSD |
| Toshiba Satellite L630 | SSD |
| ASUS X553MA / F553M | 119 GB SSD |
| HP10 / HP ProBook 4230s | SSD |
| Toshiba20 / Toshiba Satellite L850D | 112 GB SSD |
| HP ProBook 11 EE G2 | SSD |
| Early-2015 MacBook Air | SSD |
| Toshiba C50D-A | no SSD |
| Compaq Presario CQ56 | no SSD |

### Direct Action1 correction: ASUS X553MA / F553M

Action1 confirmed Laptop #07 has:

- Intel Pentium N3540
- 8 GB DDR3
- 119 GB SSD
- serial ECN0CV414937516
- IP 192.168.68.183 at the time of verification

This supersedes older records that listed a 500 GB HDD or treated its SSD status as uncertain.

### Direct Action1 correction: Toshiba Satellite L850D / Toshiba20

Action1 confirmed Laptop #03 has:

- AMD A10-4600M
- 8 GB DDR3
- 112 GB SSD
- AMD Radeon HD 7500/7600 Series + HD 7660G
- serial 5C171384R
- IP 192.168.68.184 at the time of verification

This supersedes older records that listed the L850D as HDD-only or without an SSD.

## LANCache

DadLAN LANCache was brought online on 1 October 2026 using Docker Desktop / WSL2.

- LANCache host: 192.168.68.188
- subnet: 255.255.252.0
- gateway: 192.168.68.1
- DNS container: running on TCP/UDP 53
- monolithic cache container: running and healthy
- clients are being configured to use 192.168.68.188 as DNS via DHCP
- some clients had local/custom DNS overrides and required further checking

## Authority rule

For future fleet corrections, fresh Action1 hardware data or direct machine-local hardware output outranks older remembered inventory notes.
