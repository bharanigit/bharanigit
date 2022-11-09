# KT session 1 on workflow

Requisites:

## docker-ce  
### Prerequisites
- Windows Build > 18917  
  You can check it via powershell:  `[System.Environment]::OSVersion.Version`

### Docker CE installation (WSL2)
```bash
### Install docker-ce
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get install docker-ce
sudo gpasswd -a $USER docker
sudo service docker start

### edit sudoers
$ sudo EDITOR=/usr/bin/vi visudo
### Add folowing line into the sudoers
%sudo   ALL=(ALL) NOPASSWD: /usr/sbin/service docker *

### Add configuration into your ~/.bashrc
cat >> ~/.bashrc << 'EOF'
### Docker startup
if ! sudo service docker status >/dev/null 2>&1;then
        sudo service docker start
fi
EOF

### Add daemon configuration for the docker
$ sudo cat > /etc/docker/daemon.json << 'EOF'
{
        "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"]
}
EOF
```

### Install Rancher Desktop (optional)   
If you would like to have local kubernetes for windows than this is great option. Rancher Desktop is comming with all tools packed together including Docker Cli.  
https://rancherdesktop.io/

### Install Docker CLI (If you don't want to install Rancher Desktop)
1. open windows powershell  
2. `choco install docker-cli`  


### Integrate WSL2 docker-ce with windows 
1. start > Type "Edit environment variables for your account"
2. Add DOCKER_HOST variable into the "User variables for ..."  


    Name            | Value  
    ----------------|----------------
    Variable name:  | DOCKER_HOST 
    Variable value: | tcp://[::1]:2375  



windows 10 Terminal https://community.chocolatey.org/packages/microsoft-windows-terminal/1.12.10393.0
```
choco install microsoft-windows-terminal
```

Lens https://k8slens.dev/
```
choco install lens
```

Make sure you've got the kube context available *inside* of WSL! If you don't have it yet, run this command to add it:
```
az aks get-credentials --resource-group convaidev-kaas --name convaidev-cluster --admin
```

## General tools & config steps

These will greatly increase your productivity.

Install ranger (faster than cd) and zsh (more functions than bash)
```
sudo apt install zsh ranger
```
Change default shell to zsh (run inside of WSL)
```
chsh -s $(which zsh)
```

then start `Terminal` anew, accept the last option to get a default .zshrc file at `/home/<username>/.zshrc`

after successfully installing zsh, execute the following block in `zsh`:

```
cat >> ~/.zshrc << EOF

rcd() {
    temp_file="$(mktemp -t "ranger_cd.XXXXXXXXXX")"
    ranger --choosedir="$temp_file" -- "${@:-$PWD}"
    if chosen_dir="$(cat -- "$temp_file")" && [ -n "$chosen_dir" ] && [ "$chosen_dir" != "$PWD" ]; then
        cd -- "$chosen_dir"
    fi
    rm -f -- "$temp_file"
}
bindkey -s "^o" "rcd\n"

alias l="ls -la"
alias k="kubectl"

EOF
```
this adds the shortcut `Ctrl-o` to open `ranger`. This will also sync the path when you quit ranger, just as
the command `. ranger` does (note the dot).


## Proper package manager

Will be used to install most tools in general:

* linuxbrew https://brew.sh/

NOTE: Follow the instructions of the install script very carfully! It expects you to run a couple of commands at the end.

Once you've installed brew, restart Terminal and install these 3 tools with a single command:

```
brew install kubectx okteto azure-cli
```

## Highly recommended
(but not required in this first KT session)

zoxide https://github.com/ajeetdsouza/zoxide
```
brew install zoxide
```
fzf https://github.com/junegunn/fzf#installation
```console
brew install fzf

# To install useful key bindings and fuzzy completion:
$(brew --prefix)/opt/fzf/install
```

- zinit (required for powerlevel10k and zsh-autosuggest) https://github.com/zdharma-continuum/zinit#automatic-installation-recommended
- powerlevel10k (displays kubecontext) https://github.com/romkatv/powerlevel10k#zinit
- zsh-autosuggest https://github.com/zsh-users/zsh-autosuggestions
Add this to ~/.zshrc
```
zinit light zsh-users/zsh-autosuggestions
```


- gitui https://github.com/extrawurst/gitui/
```
brew install gitui
```

- delta (better diff)
    https://dandavison.github.io/delta/introduction.html
```
brew install git-delta
```

## Docker

### Dockerfile intro

```
docker build -t meeting:latest .
docker images
docker run meeting:latest
docker ps
docker kill <container_id>
docker run --init --name whatever meeting:latest
docker kill whatever
docker rm whatever
docker run --init -d -p 8080:3980 --name background meeting:latest
docker attach background
http://localhost:8080/health
docker exec -it background sh
cat /app/src/index.ts
docker run -it --entrypoint /bin/sh meeting:latest
docker ps
docker logs <container_name>
Dockerfile in depth

docker tag meeting:latest convaipacr.azurecr.io/kt-meeting:arthur
docker images
az acr login --name convaipacr
docker push convaipacr.azurecr.io/kt-meeting:arthur

kubectx
kubectl create ns kt-arthur
kubens
git pull
kubectl apply -f deployment.yaml
error: missing secrets

k get secrets -n waka-int meeting-skill-cognitivemodels-secrets-int -o yaml > cm.yaml
k get secrets -n waka-int meeting-skill-appsettings-secrets-int -o yaml > cm.yaml

kubectl apply -f deployment.yaml

k attach pod:
k attach meeting-skill-deployment-568bb6755c-cmqx4
```


### KT 2

```

docker run -it -p 8080:3980 --mount "type=bind,source=$(pwd)/src,target=/app/src" meeting:latest sh
npm i

```


#### Mainline Development

Demo: automated deployment of wa-meeting-skill to int environment

```
pre-commit hook
mainline development
    conventional commits
    gitui
    (commitizen)
    fix: feat: BREAKING CHANGE

nvm install

```

#### ArgoCD Deployment: whoami

##### get argocd password
``` sh
cat >> ~/.zshrc << EOF
alias argopass="kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d"
EOF
```

```
# pipe into WSL clipboard
argopass | clip.exe
# pipe into mac clipboard
argopass | pbcopy
# pipe into ubuntu clipboard
argopass | xclip -selection clipboard
```

##### Open ArgoCD UI
```
k -n argocd port-forward service/argocd-server 31000:80 --context convaidev-cluster-admin
```

#### stakater/reloader

labels

#### autodeploy new images

ci.yaml
ServiceConnection
GitVersion.yaml

### Other Docker commands

#### DELETE ALL IMAGES
```
docker images -a -q | xargs docker rmi -f
```


## Not covered in the first session recording

NOTE: This will be recorded seperately without any participants, for completeness

Mount local directory in Docker container for fast dev loop
```
docker run -it -p 8080:3980 --mount "type=bind,source=$(pwd)/src,target=/app/src" meeting:latest sh
npm i
```

