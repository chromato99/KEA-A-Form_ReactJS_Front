import React, { useState, useEffect, useContext } from "react";
import "./Post.css";
import { Badge, Button, Card, Collapse } from "react-bootstrap";
import { Comment } from "../../components/Comment/Comment";
import { useNavigate, useParams } from "react-router-dom";

import { DeleteSurveyModal } from "../../components/Modal/DeleteSurveyModal";

import { SurveyContext } from "../../services/survey/survey.context";
import { AuthenticationContext } from "../../services/authentication/authentication.context";
import FadeIn from "../../animation/FadeIn";
import { PostContext } from "../../services/post/post.context";

const TIME_ZONE = 9;

export const Post = () => {
    // Context
    const { GetSurveyById, DeleteSurvey } = useContext(SurveyContext);
    const { userData, userToken, isLogin } = useContext(AuthenticationContext);
    const { GetPost, GetPostCategory, PostComment, GetComments, GetCommentCnt, UpdateViews } = useContext(PostContext);

    // Post state
    const [postData, setPostData] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [isAuthor, setIsAuthor] = useState(false);

    const [comment, setComment] = useState("");
    const [commentCnt, setCommentCnt] = useState(-1);
    const [commentsData, setCommentsData] = useState([]);
    const [category, setCategory] = useState([]);

    // Navigate
    const navigate = useNavigate();
    const { postPk } = useParams();

    // Stats
    const [open, setOpen] = useState(false);

    // On Load
    useEffect(() => {
        getPostData();
        getCommentData();
        UpdateViews(postPk);
    }, []);

    const getPostData = async () => {
        await GetPost(postPk).then((res) => {
            setPostData(res);
            setLoaded(true);
        });
        await GetPostCategory(postPk).then((res) => {
            setCategory(res);
        });
    };
    const getCommentData = async () => {
        const size = 10;
        const page = 0;
        await GetComments(postPk, size, page).then((res) => setCommentsData(res.data));
        await GetCommentCnt(postPk).then((res) => setCommentCnt(res.data));
    };

    // Check is Author
    useEffect(() => {
        if (userData != undefined && isLogin) {
            console.log("id match : ", userData.userPk, postData.postAuthor);
            if (userData.userPk == postData.author) {
                console.log("daifjsjfis");
                setIsAuthor(true);
            }
        }
    }, [userData, postData]);

    // Modal
    const [modalShow, setModalShow] = useState(false);
    const modalShowHandler = () => {
        setModalShow(true);
    };
    const modalCloseHandler = () => {
        setModalShow(false);
    };

    // DeleteSurvey
    const DeleteSurveyHandler = () => {
        const result = DeleteSurvey(postData._id, userToken);
        console.log(result);
        alert("Delete Complete!");
        navigate(-1);
    };

    const addComment = () => {
        if (comment == "") {
            alert("내용을 입력해주세요");
            return;
        }
        PostComment(userData.userPk, comment, postPk).then(() => {
            getCommentData(postPk, 10, 0);
        });
        setComment("");
    };

    const CommentBox = React.memo(() => {
        return (
            <div className="commentBox">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h3>댓글</h3>
                    <h4 style={{ marginLeft: "8px" }}> {commentCnt}개</h4>
                </div>

                {commentsData
                    ? commentsData.map((it) => {
                          return (
                              <Comment
                                  commentAuthor={it.commentAuthor}
                                  commentContent={it.commentContent}
                                  key={it.commentPk}
                                  commentPk={it.commentPk}
                                  createdDate={it.createdDate}
                                  modifiedDate={it.modifiedDate}
                                  commentLike={it.commentLike}
                                  setCommentsData={setCommentsData}
                                  commentsData={commentsData}
                                  getCommentData={getCommentData}
                              />
                          );
                      })
                    : null}
            </div>
        );
    });
    return (
        <>
            {loaded ? (
                <div className="Post Survey">
                    <DeleteSurveyModal modalShow={modalShow} modalClose={modalCloseHandler} onDelete={DeleteSurveyHandler} />
                    <FadeIn className="surveyWrapper" childClassName="childClassName">
                        <div className="contentWrapper">
                            <div className="topWrapper">
                                <div className="descWrapper">
                                    {category.map((it) => (
                                        <Badge className="categoryBadge" bg="secondary" key={it.postCategoryPk}>
                                            {it.postCategoryCategory.categoryType}
                                        </Badge>
                                    ))}
                                    <div className="title">{postData.postTitle}</div>
                                    <div className="desc">{postData.postDesc}</div>
                                </div>

                                <div className="buttonWrapper">
                                    {isAuthor ? (
                                        <Button variant="outline-danger deleteSurveyBtn" onClick={modalShowHandler}>
                                            Delete Survey
                                        </Button>
                                    ) : null}

                                    <Button variant="primary" onClick={() => navigate(`/survey/${postData.postSurvey}`)}>
                                        Enter Survey
                                    </Button>
                                </div>
                            </div>
                            <div className="postViews">
                                <b>조회수 :</b> {postData.postViews}
                            </div>
                            <div className="postStartDate">
                                <b>설문 시작 시간 : </b>
                                {postData.postStartDate[0]}년 {postData.postStartDate[1]}월 {postData.postStartDate[2]}일 {postData.postStartDate[3] + TIME_ZONE}시 {postData.postStartDate[4]}분
                            </div>
                            <div className="postDueDate">
                                <b>설문 마감 기한 : </b>
                                {postData.postDueDate[0]}년 {postData.postDueDate[1]}월 {postData.postDueDate[2]}일 {postData.postDueDate[3] + TIME_ZONE}시 {postData.postDueDate[4]}분
                            </div>
                            <div className="statistics">
                                <h3>통계</h3>
                                <Button variant="" onClick={() => setOpen(!open)} aria-controls="example-collapse-text" aria-expanded={open}>
                                    click
                                </Button>
                            </div>
                        </div>

                        <Collapse in={open}>
                            <div id="example-collapse-text">
                                <Card body style={{ width: "400px" }}>
                                    {postData.statistics}
                                </Card>
                            </div>
                        </Collapse>

                        <CommentBox />
                        <div className="commentBarWrapper">
                            <input type="text" className="commentBar" value={comment} onChange={(e) => setComment(e.target.value)} />
                            <Button id="submitBtn" onClick={addComment}>
                                등록
                            </Button>
                        </div>
                    </FadeIn>
                </div>
            ) : (
                <div className="Post Survey"></div>
            )}
        </>
    );
};