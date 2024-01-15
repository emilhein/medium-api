const getter = async (username, from) => {
    let res = await fetch("https://medium.com/_/graphql", {
        "headers": {
            "content-type": "application/json",
        },
        "body": JSON.stringify([{
            variables: {
                homepagePostsFrom: from,
                includeDistributedResponses: true,
                id: null,
                username,
                homepagePostsLimit: 25
            },
            query: `query ProfilePubHandlerQuery($id: ID, $username: ID, $homepagePostsLimit: PaginationLimit, $homepagePostsFrom: String, $includeDistributedResponses: Boolean) {
        userResult(id: $id, username: $username) {
          ... on User {
            id
            name
            username
            
            bio
            ...ProfilePubScreen_user
          }
        }
      }
      
      fragment ProfilePubScreen_user on User {
        id
        ...PublisherHomepagePosts_publisher
      }
      
      fragment PublisherHomepagePosts_publisher on Publisher {
        id
        homepagePostsConnection(paging: {limit: $homepagePostsLimit, from: $homepagePostsFrom}, includeDistributedResponses: $includeDistributedResponses) {
          posts {
            ...PublisherHomepagePosts_post
          }
          pagingInfo {
            next {
              ...PublisherHomepagePosts_pagingInfo
            }
          }
        }
      }
      
      fragment PublisherHomepagePosts_post on Post {
          ...TruncatedPostCard_post
      }
      
      fragment PublisherHomepagePosts_pagingInfo on PageParams {
        from
        limit
      }
      
      fragment TruncatedPostCard_post on Post {
        mediumUrl
        firstPublishedAt
        readingTime
        title
        extendedPreviewContent {
          subtitle
        }
        previewImage {
          id
        }
        previewContent {
            subtitle
        }
      }`


        }]),
        "method": "POST"
    })
    const [{ data }] = await res.json()
    return data
}

const getAllPosts = async (username, nextToken = null) => {
    let data = await getter(username, nextToken)
    data.userResult.homepagePostsConnection.posts.forEach(element => {
        allPosts.push(element)
    });
    console.log(data.userResult.homepagePostsConnection.pagingInfo);
    if (!data.userResult.homepagePostsConnection.pagingInfo.next) {
        return allPosts
    }
    let foundNexttoken = data.userResult.homepagePostsConnection.pagingInfo.next.from
    if (!foundNexttoken) {
        return allPosts

    }
    return getAllPosts(username, foundNexttoken)
}
let allPosts = []
module.exports.handler = async (event) => {
    let returnposts = []
    if (allPosts.length > 0) {
        returnposts = allPosts // caching
    } else {
        returnposts = await getAllPosts('emilhein1')

    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(returnposts),
    };
};