#/bin/bash
###-begin-pav-completion-###
#
# pav command completion script
#
# Installation: pav completion >> ~/.bashrc  (or ~/.zshrc)
# Or, maybe: pav completion > /usr/local/etc/bash_completion.d/pav
#

if type complete &>/dev/null; then
  complete -W "major minor patch premajor preminor prepatch prerelease from-git" pav
elif type compadd &>/dev/null; then
  _pav_completion() {
    compadd major minor patch premajor preminor prepatch prerelease from-git
  }
  compdef _pav_completion pav
elif type compctl &>/dev/null; then
  _pav_completion () {
    reply=("major" "minor" "patch" "premajor" "preminor" "prepatch" "prerelease" "from-git")
  }
  compctl -K _pav_completion pav
fi
###-end-pav-completion-###