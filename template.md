## [${version}] - ${date}
${IF (docs.length)}
#### Docs
- ${FOREACH ${doc} in ${docs}}doc${END FOREACH}
${END IF}
${IF (features.length)}
#### Features
- ${FOREACH ${feature} in ${features}}feature${END FOREACH}
${END IF}
${IF (fixes.length)}
#### Fixes
- ${FOREACH ${fix} in ${fixes}}fix${END FOREACH}
${END IF}
${IF (merges.length)}
#### Merges
- ${FOREACH ${merge} in ${merges}}merge${END FOREACH}
${END IF}
${IF (others.length)}
#### Other
- ${FOREACH ${other} in ${others}}other${END FOREACH}
${END IF}
