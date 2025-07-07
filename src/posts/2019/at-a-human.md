---
title: At a Human Scale
date: 2019-01-30T05:33:01Z
updated: 2023-01-16
---

In working through a bug of inefficient I/O use, my mind keeps coming back to [Computer Latency at a Human Scale](https://www.prowesscorp.com/computer-latency-at-a-human-scale/):

> * **One CPU cycle**: 0.4ns → 1s
> * **Level 1 cache access**: 0.9ns → 2s
> * **Level 2 cache access**: 2.8ns → 7s
> * **Level 3 cache access**: 28ns → 1min
> * **Main memory access (DDR DIMM)**: ~100ns → 4min
> * **Intel Optane memory access**: <10 μs → 7 hrs
> * **NVMe SSD I/O**: ~25 μs → 17 hrs
> * **SSD I/O**: 50–150 μs → 1.5–4 days
> * **Rotational disk I/O**: 1–10 ms → 1–9 months
> * **Internet call: San Francisco to New York City**: 65ms → 5 years
> * **Internet call: San Francisco to Hong Kong**: 141ms → 11 years

Algorithmic thinking isn’t hard. At least, it’s not the hardest thing I do. Method naming and text layout are way harder. But I often find we lack the scale for figuring out what we’re doing wrong. You wouldn’t design a task that repeats 10,000 times if each iteration took 6 months. And yet it’s so trivially easy to write a naïve database operation that goes to disk for each of ten thousand iterations.
