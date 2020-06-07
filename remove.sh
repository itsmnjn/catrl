if [[ $# -eq 0 ]] ; then
    echo 'Please specify the stage with ./deploy.sh <stage>'
    exit 1
fi

serverless remove --stage ${1} -v