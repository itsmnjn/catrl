if [[ $# -eq 0 ]] ; then
    echo 'Please specify the stage with ./deploy.sh <stage>'
    exit 1
fi

tsc
serverless deploy --aws-profile catrl  --stage ${1} -v
rm -rf *.js