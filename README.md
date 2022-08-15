[Source Map](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) - as helpful as they are, it's easy to forget how much they're revealing about the code.

This is an attempt to raise awareness about source maps as a potential attack surface.

Some example found by the bot - 
- https://app.synthesia.io/ - 16MB
- https://coreui.io/react/demo/4.0/dark/#/dashboard

Todo - 
- [x] Show incremental update on UI while fetching source map
- [x] Make deep linkable/sharable
- [ ] Show result - Leak detected or Not Detected etc
- [ ] Show how to fix
- [ ] Integrate VS Code for better search/explore
- [ ] Show list of npm packages used, maybe vulnerabilities also ?
- [ ] Try to locate sensitive info, API Paths and other automated recon
